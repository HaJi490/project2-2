'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";

import ChargingMap from "@/components/ChargingMap/ChargingMap";
import {ChargingStationResponseDto, ChargingStationRequestDto} from '../types/dto'
import nmToid from '../db/busi_id.json'
import Image from "next/image";

interface Filters {
  lat: number;
  lon: number;
  radius: number;
  canUse: boolean;
  parkingFree: boolean;
  limitYn: boolean;
  chargerTypes: string[];
  chargerComps: string[];
  outputMin: number;
  outputMax: number;
  keyWord?: string;
}

export default function Home() {
  const ongoing = useRef<AbortController | null>(null); // 1) AbortController 로 이전 요청 취소
  const[chgerData, setChgerData] = useState<ChargingStationResponseDto[]>([]);  // resp
  const [currentFilter, setCurrentFilter] = useState<Filters>({                 // req에 담을 정보
      lat: 0,
      lon: 0,
      radius: 2000,
      canUse: false,
      parkingFree: false,
      limitYn: false,
      chargerTypes: [],
      chargerComps: [],
      outputMin: 0,
      outputMax: 300, 
      keyWord: '',
  });
  const [myPos, setMyPos] = useState<[number, number] | null >(null);           // 맵에 쓰일 현재위치 _ 반경표시
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);    // 맵의 중심  // 초기값설정해두면 fetch가 두번 반복되기 때문에 맵에 그려질 수도 있고 아닐 때도 있는거

  // 1. 충전소 정보 가져오기
    const fetchStations = useCallback(async (filtersToApply: Filters) => {
      ongoing.current?.abort();                   // 직전 요청 취소
      const controller = new AbortController();   // 새 컨트롤러
      ongoing.current = controller;

    function CompNmToIds(selectedNm: string[]):string[]{
      return nmToid.filter(company => selectedNm.includes(company.busi_nm))
                  .map(company => company.busi_id);
    }
    // API 요청 DTO에 맞게 필터 객체 구성
    const requestBody: ChargingStationRequestDto = {
      "coorDinatesDto" : {
        lat: filtersToApply.lat,
        lon: filtersToApply.lon,
        radius: filtersToApply.radius,
      },
      "mapQueryDto":{
        useMap: true,
        canUse: filtersToApply.canUse,
        parkingFree: filtersToApply.parkingFree,
        limitYn: filtersToApply.limitYn,
        chgerType: filtersToApply.chargerTypes.length > 0 ? filtersToApply.chargerTypes : [], // 빈 배열일 때 undefined로 보내는 등 백엔드에 맞게 조정
        busiId: filtersToApply.chargerComps.length > 0 ? CompNmToIds(filtersToApply.chargerComps) : [],
        outputMin: filtersToApply.outputMin,
        outputMax: filtersToApply.outputMax,
        keyWord: filtersToApply.keyWord
      }
    };

    console.log("API 요청 보낼 필터:", requestBody);

    try {
      const res = await axios.post<ChargingStationResponseDto[]>(
        `http://${process.env.NEXT_PUBLIC_BACKIP}:8080/map/post/stations`,
        requestBody,
        { signal: controller.signal } 
      );
      const data = res.data;

      setChgerData(Array.isArray(data) ? data : []);
      console.log("충전소 정보:: ", data);
    } catch (err) {
      if (axios.isCancel(err)) return;            // “정상 취소”는 무시
      console.error("fetchStations error: ", err);
      setChgerData([]);
    }
  }, []); 

  // 받은 chgerData markers에 넣기
  const markers = useMemo(() => {
    console.log('Memo: marker 재생성')  
    return chgerData.map((item) => ({ // 🍕 respDummies 로 변경
                id: item.statId,
                name: item.statNm,
                lat: item.lat,
                lng: item.lng,
                availableCnt: item.chargeNum,
      }));
    }, [chgerData]);

  // 2. 현재위치 가져오기
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setMapCenter([lat, lng]);
      setMyPos([lat, lng]);
    },
    (error) => {
      console.error('위치정보를 가져오지 못했습니다.', error);
      // 위치 못가져오면 부산대역- 디폴트값
      const defaultPos: [number, number] = [35.1795, 129.0756]
      setMapCenter(defaultPos);
      setMyPos(defaultPos);
    }
  )
  }, [])

  // 3. 카카오지도 api 로드확인 및 콜백 등록
  // useEffect(()=>{
  //   //window객체 존재 확인
  //   if(window.kakao && window.kakao.maps){
  //     window.kakao.maps.load(() => {
  //       if(window.kakao.maps.services){
  //         console.log('KakaoMap API 로드 성공');
  //         setKakaoMapLoaded(true);
  //       } else {
  //         console.error('KakaoMap API services 로드 실패')
  //       }
  //     });
  //   } else {
  //     console.warn('KakaoMap API 아직 로드안됨')
  //     // 일정시간 후 다시 시도하거나 사용자에게 알림 ---------------------  FIXME
  //     // layout.tsx에 strategy옵션 확인 //gemini '오류는...'
  //   }
  // },[])

  // 4. currentFilter 변경 시 충전소 정보 다시 불러오기
  useEffect(()=>{
    if (myPos ) { 
        const filtersToRequest = {
            ...currentFilter,
            lat: myPos[0], // 위치 정보는 항상 myPos에서 가져옵니다 (Single Source of Truth)
            lon: myPos[1],
        };
        // setCurrentFilter(filtersToRequest);
        fetchStations(filtersToRequest);
    }
  },[myPos, currentFilter, fetchStations])

  // 9. 지도 현위치에서 검색
  const handleSearchHere = useCallback((center: {lat: number, lng: number}) =>{
    const lat = center.lat;
    const lng = center.lng;
    console.log('지도중심 좌표: ', lat, lng);
    setMyPos([lat, lng]);
    setMapCenter([lat, lng]);
    
    // setCurrentFilter(prev => ({
    //   ...prev,
    //   lat: lat,
    //   lon: lng,
    // }));
  },[]) //재생성될 필요가 없으므로

  return (
    <div className="w-full h-screen flex flex-col">
      <p className="p-4 font-bold">지도</p>
      <div className="flex-grow w-full h-full">
        {myPos && mapCenter &&
          <ChargingMap myPos={myPos} radius={currentFilter.radius} mapCenter={mapCenter} markers={markers} posHere={handleSearchHere}/>
        }
      </div>
    </div>
  );
}
