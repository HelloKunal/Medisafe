import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

let CalendarID = 0;
let sDate, eDate, testEventData, testAsyncData;

import moment from 'moment'; 
var now = moment().format("YYYY-MM-DD");

// const testEventData = {
//   title: "Paracetamol",
//   startDate: "2021-11-21T10:00:00.000Z",
//   endDate: "2021-11-21T11:00:00.000Z",
//   occurrence: 5,
// };

// const testAsyncData = {
//   name: "Paracetamol",
//   quantity: 5,
//   time: 1,
// };

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        console.log('Here are all your calendars:');
        console.log({ calendars });
      }
    })();
  }, []);

  const [AsyncData, setAsyncData] = useState();
  
  const getData = async () => {
    try {
      const recievedAsyncData = await AsyncStorage.getItem('@storage_Key')

      // setAsyncData(recievedAsyncData);
      testAsyncData = JSON.parse(recievedAsyncData);
      // console.warn(recievedAsyncData);
      return recievedAsyncData != null ? recievedAsyncData : null;
      return recievedAsyncData != null ? JSON.parse(recievedAsyncData) : null;
    } catch(e) {
      // error reading value
      console.warn("ERROR");
      console.warn(e);
    }
  }
  
  getData();
  return (
    <View style={styles.container}>
      <Text>Just for setup, Click this button once, and all your reminders will be synced with google calendar on your phone.</Text>
      <Button title="Create a new calendar" onPress={createCalendar} />
      <Button title="Calendar ID" onPress={() => {console.warn(CalendarID)}} />
      <Button title="Get Data" onPress={() => {console.log(testAsyncData)}} />
      <Button title="Delete All Calendars" onPress={() => {
        for(let i = 30; i < 100; i++) {
          try {
            Calendar.deleteCalendarAsync(i.toString())
          }
          catch(e) {
            //
          }
        }
      }} />
      <Button title="Add Event Diff" onPress={() => {
        for(let tAD of testAsyncData) {          
          sDate = new Date(now + 'T' + ((tAD.time == 1) ? '09' : (tAD.time == 2) ? '14' : '21') + ':00:00.000Z');
          eDate = new Date(now + 'T' + ((tAD.time == 1) ? '10' : (tAD.time == 2) ? '15' : '22') + ':00:00.000Z');
          console.log(sDate);
          console.log(eDate);
          console.log(tAD.quantity);
          testEventData = {
            title: tAD.name,
            startDate: sDate,
            endDate: eDate,
            occurrence: Number(tAD.quantity),
          }
          addEvent(testEventData)
        }
      }} />
    </View>
    // 
  );
}
async function getDefaultCalendarSource() {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

async function createCalendar() {
  // console.warn(`Running`);
  const defaultCalendarSource =
    Platform.OS === 'ios'
      ? await getDefaultCalendarSource()
      : { isLocalAccount: true, name: 'Expo Calendar' };
  const newCalendarID = await Calendar.createCalendarAsync({
    title: 'Expo Calendar',
    color: 'blue',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendarSource.id,
    source: defaultCalendarSource,
    name: 'internalCalendarName',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  CalendarID = newCalendarID;
  console.log(`Your new calendar ID is: ${newCalendarID}`);
}

async function addEvent(eventData) {
  // console.warn(`Running`);
  const newCalendarEvent = await Calendar.createEventAsync(CalendarID, {
    "startDate": eventData.startDate,
    "endDate": eventData.endDate, // removing this field allows the update to succeed
    "notes": "Medicine Reminder",
    "title": eventData.title,
    "location": "",
    "alarms": [
      {
        "relativeOffset": 0
      }
    ],
    "allDay": false,
    "url": "",
    "timeZone": "Asia/Kolkata",
    "organizerEmail": "test@example.com",
    "recurrenceRule": {
      "frequency": "daily",
      "interval": 0,
      "occurrence": eventData.occurrence,
    },
  });
  console.warn(`Done`);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
