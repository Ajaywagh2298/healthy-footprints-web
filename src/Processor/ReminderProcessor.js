import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_HOST_URL } from '../config/config';

function ReminderProcessor() {
    const [reminders, setReminders] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));
    const userUid = user ? user.user.uid : null;

    const fetchReminders = async () => {
        try {
            const response = await axios.get(`${BACKEND_HOST_URL}/api/reminders/`,
                {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': 'https://healthy-footprints-web.vercel.app'
                },
                withCredentials: true, // This includes cookies in the request if your backend expects them
              });
            setReminders(response.data);
            console.log('Reminders fetched:', response.data); // Debugging log
        } catch (error) {
            console.error('Failed to fetch reminders:', error);
        }
    };

    const processReminders = () => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        reminders.forEach((reminder) => {
            const {
                reminderFrequency,
                reminderTimeStart,
                reminderTimeDay,
                reminderTimeDate,
                reminderType,
                reminderMessage,
                note,
                notificationPushType
            } = reminder;

            if (reminderTimeStart === currentTime) {
                let shouldNotify = false;

                switch (reminderFrequency) {
                    case 'Daily':
                        shouldNotify = true;
                        break;

                    case 'Weekly':
                        const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
                        if (reminderTimeDay.includes(currentDay)) {
                            shouldNotify = true;
                        }
                        break;

                    case 'Monthly':
                        const currentDate = now.getDate();
                        if (currentDate === new Date(reminderTimeDate).getDate()) {
                            shouldNotify = true;
                        }
                        break;

                    case 'Day':
                        if (reminderTimeDate === now.toISOString().split('T')[0]) {
                            shouldNotify = true;
                        }
                        break;

                    default:
                        break;
                }

                if (shouldNotify) {
                    if (notificationPushType === 'all' || notificationPushType === userUid) {
                        console.log('Notification triggered:', reminder); // Debugging log
                        showNotification(reminderType, reminderMessage, note);
                        sendAndroidNotification(reminderType, reminderMessage, note);
                    }
                }
            }
        });
    };

    const showNotification = (title, message, note) => {
        toast.info(
            <div>
                <strong>{title}</strong>
                <p>{message}</p>
                {note && <small><em>{note}</em></small>}
            </div>,
        );
    };

    const sendAndroidNotification = (title, message, note) => {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: message + (note ? `\n${note}` : ''),
                icon: '/path/to/icon.png' // Optional: Add an icon path
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, {
                        body: message + (note ? `\n${note}` : ''),
                        icon: '/path/to/icon.png' // Optional: Add an icon path
                    });
                }
            });
        }
    };

    useEffect(() => {
        fetchReminders();
        const syncInterval = setInterval(fetchReminders, 600000); 
        return () => clearInterval(syncInterval);
    }, []);

    useEffect(() => {
        const checkInterval = setInterval(() => {
            fetchReminders();
            processReminders(); // Check reminders immediately after fetching
        }, 60000); // Check every minute
        return () => clearInterval(checkInterval);
    }, []); // No dependency on reminders array

    return (
        <div>
            <ToastContainer />
        </div>
    );
}

export default ReminderProcessor;
