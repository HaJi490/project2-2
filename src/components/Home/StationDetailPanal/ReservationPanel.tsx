'use client'

import React, {useRef, useEffect, useState} from 'react'
import axios from 'axios';
import { useAtom } from 'jotai';
import { accessTokenAtom } from '@/store/auth';

import Toast from '@/components/Toast/Toast';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
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
    const [toastMsg, setToastMsg] = useState<string>('');
    const [confirmMsg, setConfirmMsg] = useState<string>('');
    const [confSubMsg, setConfSubMsg] = useState<string>('');
    // showConfirmModal -- 필요한가? 확인, 취소할때 false, 예약정보확인 true 설정하기

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
        const WEEKDAY = [ '일', '월', '화', '수', '목', '금', '토']
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = WEEKDAY[date.getDay()];

        if(type === 'kor'){
            return `${year}년 ${month}월 ${day}일 (${weekday})`
        }
        else if (type === 'iso') {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        return '';
    }

    // 충전기 타입 변환
    const typeCodeToNm = (chgerCode: string) => {
        const match = codeToNm.find(type => chgerCode.includes(type.code));
        return match?.type || '';
    }

    // 3. 예약현황 가져오기
    const handleTimeslots = async(date: Date)=>{
        setSelectedDate(date);
        setShowDatePicker(false);

        const requestBody = {
            statId: charger.statId,
            chgerId: charger.chgerId,
            date: formatDateString(date, 'iso'),
        }

        try{
            const res = await axios.post<TimeInfo[]>(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/time/timeslots`,
                requestBody
            )
            setGetTimeslots(res.data);
        } catch (error) {
            console.error('handleTimeslots 에러: ', error);
        }
    }

    // 3-2. 시간대별 필터링
    const amTimes = getTimeslots?.filter(item => {
        const hour = parseInt(item.startTime.slice(0, 2));
        return hour < 12;
    })

    const pmTimes = getTimeslots?.filter(item => {
        const hour = parseInt(item.startTime.slice(0, 2));
        return hour >= 12;
    })

    // 3-3. 시간버튼 렌더링
    const renderTimeButton = (times: typeof getTimeslots) => {
        return times?.map((item) => {
            const timeStr = item.startTime.slice(0, 5);
            const isSelected = selectedTime.includes(timeStr);
            const isDisabled = !item.enabled;
            const slotClasses = `p-2 text-center rounded-md text-sm cursor-pointer transition
                                ${isDisabled && 'bg-gray-200 text-gray-400 cursor-not-allowed' }
                                ${isSelected && 'bg-blue-500 text-white font-bold ring-2 ring-blue-300'}
                                ${!isDisabled && !isSelected && 'bg-gray-100 hover:bg-blue-100'} `

            return(
                <button
                    key={item.timeId}
                    disabled={isDisabled}
                    className={slotClasses}
                    onClick={()=> !isDisabled && handleTimeslotChecked(timeStr, !isSelected)}
                >
                    {timeStr}
                </button>
            )
        })
    }

    // 4. 연속성 검사
    const isConsecutive  = (arr: number[]) => {
        if (arr.length <= 1) return true;
        const sorted = [...arr].sort((a, b)=> a - b);
        for (let i = 1; i < sorted.length; i++){
            if(sorted[i] !== sorted[i-1] +1){
                return false;
            }
        }
        return true;
    }

    // 4-2. 시간선택 핸들러
    const handleTimeslotChecked = (value: string, checked: boolean)=>{
        const newSelected = checked
            ? [...selectedTime, value]
            : selectedTime.filter((time) => time !== value);

            const selectedTimeIds = getTimeslots?.filter(slot =>
                newSelected.includes(slot.startTime.slice(0, 5))
            ).map(slot => slot.timeId);

            if(!isConsecutive(selectedTimeIds || [])) {
                setToastMsg('연속된 시간대만 선택할 수 있습니다.');
                return;
            }
            setSelectedTime(newSelected);
    }

    // 5. 예약 확인
    const handleConfirmReservation = () =>{
        if(!selectedTime?.length){
            setToastMsg('시간대를 선택해주세요.');
            return;
        }

        if(!token) {    // 아래에 알림으로 띄워주기 --  FIXME
            setToastMsg('로그인이 필요한 서비스입니다.');
            return;
        }

        setConfirmMsg('예약 확정하시겠습니까?');
        setConfSubMsg('충전소: \n주소: \n 충전기: \n날짜: \n시간: \n');
    }

    // 6. 예약 확정
    const handleReservation = async() => {
        const selectedTimeIds = getTimeslots?.filter(slot =>
            selectedTime.includes(slot.startTime.slice(0, 5))
        ).map(slot => slot.timeId);
        
        try{
            const res = await axios.post(
                `http://${process.env.NEXT_PUBLIC_BACKIP}:8080/reserve/setSlots`,
                {slotIds: selectedTimeIds},
                {headers: {Authorization: `Bearer ${token}`}}
            )
            setToastMsg('예약이 완료되었습니다.')
        } catch (error) {
            console.log('handleReservation 에러: ', error);
            setToastMsg('예약에 실패하였습니다.')
        }
    }

    return (
        <div 
            ref={reservRef}
            className='w-full pt-4 border-t fixed bottom-0 left-0 right-0 px-4 bg-white z-20 shadow-lg rounded-lg'
        >
            <Toast message={toastMsg} setMessage={setToastMsg}/>
            <ConfirmModal message={confirmMsg} submsg={confSubMsg} onConfirm={()=>handleReservation()} onCancel={()=>{}}/>
            <div>
                <p className='text-bold'>{charger.chgerId}</p>
                <p className='flex'>
                    {typeCodeToNm(charger.chgerType).split('+').map((part, idx, arr) => (
                        <React.Fragment key={idx}>
                            <span>{part}</span>
                            {idx < arr.length - 1 && (
                                <span className='text-[#afafaf]'><LuDot/></span>
                            )}
                        </React.Fragment>
                    ))}
                </p>
            </div>
            <div className='font-bold text-[#4FA969]' onClick={()=>setShowDatePicker(true)}>

            </div>
        </div>
    )
}
