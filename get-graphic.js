import dayTypes from "./day-types-data.js";
import findHolidays from "./find-holidays.js";
import findSalary from "./find-salary.js";
import isEmpty from "./is-empty.js";
import deepCopy from "./deep-copy.js"
import calcFinalTime from "./calc-final-time.js";
import daysPlus from "./days-plus.js";
import convertTimeArr from "./convert-time-arr.js";

import mergeDeep from "./deep-merge-objects.js";
import deleteSameValues from "./delete-same-values.js";


export default function getGraphic(year, month, graphic) { //смены 14.1, 14.2, 16.1-1, 16.1-2, 16.2-1, 16.2-2;

    const graphicD = [];
    // if(year < 2000) { year = 2000};
    const now = new Date(year, month);
    const currentYear = now.getFullYear(); // Текущий год
    const currentMonth = now.getMonth(); // Текущий месяц
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate(); // Последнее число текущего месяца
    const firstDate = new Date(currentYear, currentMonth, 1); // Первая дата месяца
    const finishDate = new Date(currentYear, currentMonth, lastDay); // Последняя дата месяца
    
    let startDate; // Начало отсчёта смен 
    
    switch (graphic) {
    
        case "14.1":
        case "16.1-2":
            startDate = new Date("2000/01/04"); 
            break;
    
        case "14.2":
        case "16.2-2":
            startDate = new Date("2000/01/07");
            break;
    
        case "16.1-1":
            startDate = new Date("2000/01/10"); 
            break;
    
        case "16.2-1":
            startDate = new Date("2000/01/01");
            break;
    }
    
    function calcTime() {

        switch (this.actualType) {
            case "day-off":
            case "cal-sick":
            case "cal-vac":
            case "day-off-oex":
                delete this.time;
                delete this.dates;
                delete this.finalTime;
                return;
        }


        const dates = {};
    
        for (let key in this.time) { // actual graphic
            if (Array.isArray(this.time[key])) {
                dates[key] = convertTimeArr(this.time[key], this.date);
            } else {
                dates[key] = {};
                for (let key1 in this.time[key]) { // break shift
                    dates[key][key1] = convertTimeArr(this.time[key][key1], this.date);
                }
            }
        }
    
        this.dates = dates;
    
    
        this.finalTime = {};
        this.finalTime.actual = calcFinalTime(dates.actual.shift, dates.actual.break);
        this.finalTime.graphic = calcFinalTime(dates.graphic.shift, dates.graphic.break);
    
    }
    function checkHoliday() {
        if(this.holiday) {
            this.possibleTypes = deepCopy(this.possibleTypes);
            this.possibleTypes.push("day-off");
        }
    }

    const dayOff = {
        ...dayTypes.find(day => day.actualType === "day-off"),
        graphicType: "day-off",
        note:"",
        holiday: false,
        possibleTypes:["cal-omd", "cal-ond", "cal-sick", "cal-vac"],
    };
    
    const morningDay = {
        ...dayTypes.find(day => day.actualType === "cal-mdg"),
        graphicType: "cal-mdg",
        calcTime:calcTime,
        checkHoliday:checkHoliday,
        note:"",
        holiday: false,
        possibleTypes:["cal-ndg", "cal-sick", "cal-vac", "day-off-oex"],
    };
    
    const nightDay = {
        ...dayTypes.find(day => day.actualType === "cal-ndg"),
        graphicType: "cal-ndg",
        calcTime:calcTime,
        checkHoliday:checkHoliday,
        note:"",
        holiday: false,
        possibleTypes:["cal-mdg", "cal-sick", "cal-vac", "day-off-oex"],
    };
    

    
    function addDay(date, spread) {
        if (date <= finishDate && date >= firstDate) {
            
            const day = {
                date:new Date(date),
                dayWeek: [7, 1, 2, 3, 4, 5, 6][new Date(date).getDay()],
                ...spread,
            };
    
            if (day.date.toLocaleDateString() === new Date().toLocaleDateString()) { day.today = true; }
    
            findHolidays(date, (annotation) => {day.holiday = true; day.annotation = annotation;});
            findSalary(date, () => {day.salary = true;});

            if (day.calcTime) { day.calcTime(); }
            if (day.checkHoliday) { day.checkHoliday(); }

    
            graphicD.push(day);
        }
    }
    
     function findStartDate(daysInCycle) {
    
        for (startDate; startDate < firstDate; daysPlus(startDate, daysInCycle)) {} // Считаем дату начала смен в месяце
    
        if (startDate.getDate() !== 1) { // откатываем начало смен на прошлый месяц если это не первое число 
            daysPlus(startDate, -daysInCycle);
        }
     }
    
    if (graphic === "14.1" || graphic === "14.2") {
    
        findStartDate(6);
    
        for (startDate; startDate <= finishDate; daysPlus(startDate, 1)) {
            addDay(startDate, morningDay);
            addDay(daysPlus(startDate, 1), morningDay);
            addDay(daysPlus(startDate, 1), morningDay);
            addDay(daysPlus(startDate, 1), dayOff);
            addDay(daysPlus(startDate, 1), dayOff);
            addDay(daysPlus(startDate, 1), dayOff);
        }
    } else {
    
        findStartDate(12);
    
        for (startDate; startDate <= finishDate; daysPlus(startDate, 1)) {
            addDay(startDate, morningDay);
            addDay(daysPlus(startDate, 1), morningDay);
            addDay(daysPlus(startDate, 1), morningDay);
            addDay(daysPlus(startDate, 1), dayOff);
            addDay(daysPlus(startDate, 1), dayOff);
            addDay(daysPlus(startDate, 1), dayOff);
            addDay(daysPlus(startDate, 1), nightDay);
            addDay(daysPlus(startDate, 1), nightDay);
            addDay(daysPlus(startDate, 1), nightDay);
            addDay(daysPlus(startDate, 1), dayOff);
            addDay(daysPlus(startDate, 1), dayOff);
            addDay(daysPlus(startDate, 1), dayOff);
        }
    }
    
    

    const key = `${year}:${month}:${graphic}`;

    if(localStorage.getItem(key)) {
    
        const lsData = JSON.parse(localStorage.getItem(key));
    
        for(let day in lsData) {

            const dayIndex = +day - 1;
            
            deleteSameValues(lsData[day], graphicD[dayIndex]);

            if(isEmpty(lsData[day])) {
                delete lsData[day]
            } else {
                graphicD[dayIndex] = mergeDeep(graphicD[dayIndex], lsData[day]);
            }
            
            if(graphicD[dayIndex].time) {
                graphicD[dayIndex].calcTime = calcTime;
                graphicD[dayIndex].calcTime();
            }
            if(graphicD[dayIndex].holiday && graphicD[dayIndex].graphicType !== "day-off") {
                graphicD[dayIndex].checkHoliday();
            }
        }

        if(isEmpty(lsData)) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, JSON.stringify(lsData));
        }

    
    }
    
    console.log(graphicD);

    return graphicD;
    }

    // getGraphic(new Date().getFullYear(), new Date().getMonth(), "16.1-1");