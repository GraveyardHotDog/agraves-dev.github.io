const statboticsAPIUrl = "https://api.statbotics.io/v3"
const tbaUrl = "https://www.thebluealliance.com/api/v3"

const tbaKey = "8AkcVwTGB8OuJNQrxoM2tADm8pcQamwOADpKEzU5E6VpFnlafLCnJxJG0rfO9b4k"

let table = document.getElementById("dataTable").getElementsByTagName("tbody")[0];
let textBox = document.getElementById("Team Number");
let eventText = document.getElementById("Next Event")
let nextEvent = ""

const fetchTbaData = async (teamNumber) => {
    try {
        const response = await fetch(`${tbaUrl}/team/frc${teamNumber}`, {
            headers: {
                "X-TBA-Auth-Key": tbaKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch team data:", error);
    }
};

const fetchStatboticsEPA = async (teamNumber) => {
    try {
        const response = await fetch(`${statboticsAPIUrl}/team/${teamNumber}`)

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data.norm_epa.current;
    } catch (error) {
        console.error("Failed to fetch team data:", error);
        return 0;
    }
};


const fetchNextEventTeams = async (teamNumber) => {
    try {
        let response = await fetch(`${tbaUrl}/team/frc${teamNumber}/events/simple`, {
            headers: {
                "X-TBA-Auth-Key": tbaKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        let data = await response.json();

        nextEvent = ""
        let date = new Date();
        let lastDate = ""
        let firstTrue = true
        let currentDate = date.getTime()
        let nextEventName = ""
        for(let i = data.length - 1; i >= 0; i--) {
            let eventDate = Date.parse(data[i].end_date)
            if(eventDate > currentDate && (eventDate < lastDate || firstTrue)) {
                nextEvent = data[i].key
                lastDate = eventDate
                firstTrue = false
                nextEventName = data[i].name
            }
        }
        eventText.innerHTML = "Next Event: " + nextEventName;

        response = await fetch(`${tbaUrl}/event/${nextEvent}/teams`, {
            headers: {
                "X-TBA-Auth-Key": tbaKey,
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        data = await response.json();

        console.log(data)
        return data;
    } catch (error) {
        console.error("Failed to fetch team data:", error);
    }
}

let dataOrder = {
    NAME: 0,
    NUMBER: 1,
    NORMALIZED_EPA: 2
}

const addTeamData = async (teamNumber) => {
    table.innerHTML = "";
    let teams = await fetchNextEventTeams(teamNumber);
    let teamData = [];

    for (let team of teams) {
        let statboticsData = await fetchStatboticsEPA(team.team_number);
        teamData.push({
            name: team.nickname,
            number: team.team_number,
            normalizedEPA: statboticsData
        });
    }

    teamData.sort((a, b) => b.normalizedEPA - a.normalizedEPA);
    teamData.forEach(team => {if(team.normalizedEPA === 0) team.normalizedEPA = "unknown"})

    for (let team of teamData) {
        let row = table.insertRow();
        row.insertCell(dataOrder.NAME).innerHTML = team.name;
        row.insertCell(dataOrder.NUMBER).innerHTML = team.number;
        row.insertCell(dataOrder.NORMALIZED_EPA).innerHTML = team.normalizedEPA; // Formatting EPA to 2 decimal places
    }
}

textBox.addEventListener("keydown", (event) =>{
    if(event.key === "Enter") {
        addTeamData(textBox.value);
    }
});