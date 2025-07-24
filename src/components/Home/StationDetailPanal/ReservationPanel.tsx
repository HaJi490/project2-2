'use client'

import React, {useRef, useEffect, useState} from 'react'
import axios from 'axios';
import { useAtom } from 'jotai';
import { accessTokenAtom } from '@/store/auth';

import { ChargerInfoItem, TimeInfo } from '@/types/dto';
import { LuDot } from "react-icons/lu";
// import Calender from '';/
import codeToNm from '../../../db/chgerType.json'

interface ReservationPanelProps {
    charger: ChargerInfoItem,
    onClose: () => void,
}

type DateFormatTp = 'kor' | 'iso'

export default function ReservationPanel({charger, onClose}: ReservationPanelProps) {
    const [token] = useAtom(accessTokenAtom);
    const reservRef = useRef<HTMLDivElement>(null);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [showDatePicker, setShowDatePicker] = useState<boolean>(true);
    const [selectedTime, setSelectedTime] = useState<string[]>([]);
    const [getTimeslots, setGetTimeslots] = useState<TimeInfo[]>();
    const [timeFilter, setTimeFilter] = useState<string>('AM');

    // 1. 외부 클릭시 닫기
    useEffect(()=>{
        const handleClickOutside = (e: MouseEvent)=> {
            if(reservRef.current && !reservRef.current.contains(e.target as Node)) {
                onClose();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    },[onClose])

    // 2. 날짜 포맷함수
    const formatDateString = (date: Date, type: DateFormatTp = 'kor') => {
        const WEEKDAY = [ '일', '월',  '화', '수', '목', '금', '토']
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = WEEKDAY[date.getDay()];
    }

    return (
        <div>
            
        </div>
    )
}
