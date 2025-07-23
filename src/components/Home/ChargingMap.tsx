'use client'

import React, { use, useEffect, useState } from 'react'
import { Map, MapMarker, useKakaoLoader, CustomOverlayMap, Circle, MarkerClusterer } from 'react-kakao-maps-sdk'
import TimeFilter from '../Admin/filters/TimeFilter'
import { IoRefreshOutline } from "react-icons/io5";
import { IoReloadOutline } from "react-icons/io5";

interface ChargingMapProps {
    myPos: [number, number] | null;
    markers: MarkerType[];
    radius: number;
    selectedStationId?: string | null;
    posHere: (center: { lat: number; lng: number }) => void;
    mapCenter: [number, number] | null;
    predictHours: number;
    onHoursChange: React.Dispatch<React.SetStateAction<number>>; // setter 타입
}

type MarkerType = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    availableCnt: number;
    changeStatus: 'increase' | 'decrease' | 'same' | 'none';
    chargerTypes: {
            fastCount: number;
            fastTotal: number;
            midCount: number;
            midTotal: number;
            slowCount: number;
            slowTotal: number;
        }, 
};

// 마커 클릭 시 정보창을 관리하기 위한 상태
type InfoWindowState = {
    position: {
        lat: number;
        lng: number;
    },
    content: string;
    stationId: string;
    chargerTypes: {
            fastCount: number;
            fastTotal: number;
            midCount: number;
            midTotal: number;
            slowCount: number;
            slowTotal: number;
        }
} | null;


export default function ChargingMap({ myPos, radius, mapCenter, markers, selectedStationId, posHere, predictHours, onHoursChange }: ChargingMapProps) {
    const [map, setMap] = useState<kakao.maps.Map>(null); // 지도인스턴스 저장
    const [infoWindow, setInfoWindow] = useState<InfoWindowState>(null);
    const [currentZoom, setCurrentZoom] = useState(5);
    
    const [isMapMoved, setIsMapMoved] = useState(false);
    const [showPredictBtn, setShowPredictBtn] = useState<boolean>(false);

    const MIN_CLUSTER_LEVEL = 6; // 클러스터링 최소레벨

    // 0. 
    useEffect(()=>{

    },[])

    // 1. Hook을 이용하여 Kakao맵 불러오기
    const [loading, error] = useKakaoLoader({
        appkey: process.env.NEXT_PUBLIC_KAKAO_JSKEY!, //non-null 추가
        libraries: ["clusterer", "services"],
    });

    // 2. 선택된 충전소 변경시 지도중심 이동 및 확대- mapCenter
    useEffect(() => {
        console.log('[ChargingMap] 2.선택된 충전소 변경시')
        if (!map || !selectedStationId) return;

        const selectedMarker = markers.find(marker => marker.id === selectedStationId);

        if (selectedMarker) {
            const position = new kakao.maps.LatLng(selectedMarker.lat, selectedMarker.lng);
            map.setLevel(3, { anchor: position }); // 레벨 3으로 확대
            map.panTo(position); // 부드럽게 이동
        }
    }, [selectedStationId, map]);

    // 3. mapCenter prop변경시 지도 중심 이동
    useEffect(() => {
        console.log('[ChargingMap] 3.mapCenter 변경시')
        if (map && mapCenter) {
            console.log('[ChargingMap] 3-', mapCenter);
            // 새로운 좌표객체
            const moveLatLon = new kakao.maps.LatLng(mapCenter[0], mapCenter[1]);

            // 부드럽게 지도 이동
            map.panTo(moveLatLon);
        }
    }, [mapCenter, map])

    // 4. '현지도에서 검색' 핸들러
    const handleSearchHere = () => {
        console.log('[ChargingMap] 4.현지도에서 검색 클릭시');
        if (map) {
            const center = map.getCenter();
            posHere({ lat: center.getLat(), lng: center.getLng() }); // 부모로 전달 

            setIsMapMoved(false);
        }
    }

    // 5. 마커클릭 핸들러
    const handleMarkerClick = (marker: MarkerType) => {
        console.log('[ChargingMap] 5. 마커클릭 시');
        if(infoWindow && infoWindow.stationId === marker.id){
            // 이미 선택된 마커를 다시 클릭하면 정보창 닫기
            setInfoWindow(null); 
        } else{
            // 새로운 마커 클릭시 정보창 열기
            setInfoWindow({
                position: { lat: marker.lat, lng: marker.lng },
                content: marker.name,
                stationId: marker.id,
                chargerTypes: marker.chargerTypes,
            });
        }
    }

    // 로딩중일때 보여줄 화면
    if (loading) {
        return <div>map Loading...</div>
    }

    // 에러 발생시 보여줄 화면
    if (error) {
        console.log('[지도 불러오기 실패]', error)
        return <div>카카오 지도 불러오기는 데 실패했습니다.</div>
    }



    // 로딩이 완료되면 지도 렌더링
    return (
        <div className='relative w-full h-full'>
            <Map center={mapCenter ? { lat: mapCenter[0], lng: mapCenter[1] } : { lat: 35.1795, lng: 129.0756 }} // 초기 중심좌표(디폴트: 부산대역)
                style={{ width: "100%", height: "100%" }}
                level={5}
                onCreate={setMap}   // map인스턴스를 저장
                onIdle={(map) => setCurrentZoom(map.getLevel())} // 줌 레벨 변경 시 state 업데이트
                onDragStart={() => setIsMapMoved(true)} // 사용자가 드래그하면
            >
                {/* 내 위치기반 반경 */}
                {myPos && (
                    <Circle center={{ lat: myPos[0], lng: myPos[1] }}
                        radius={radius}
                        strokeWeight={2}
                        strokeColor={'#4FA969'}
                        strokeOpacity={0.5}
                        fillColor={'#4FA969'}
                        fillOpacity={0.2}
                    />
                )}

                {/* 2. 맵객체 확실히 생긴후 클러스터, 마커 생성 */}
                {map && 
                    <>
                        {/* 마커 클러스터러 */}
                        <MarkerClusterer 
                            key={markers.length > 0 ? `${markers.length}-${mapCenter}` : mapCenter?.join('-')}    // 마커가 바뀔때마다 바뀌는값으로 key값을 주기❗
                            averageCenter={true}   // 클러스터 마커를 평균 위치로 설정
                            minLevel={MIN_CLUSTER_LEVEL}    // 클러스터링 최소 레벨
                            // disableDefaultClick={true}
                            styles={[
                                {
                                    width: '50px', height: '50px',
                                    background: '#51cf66',
                                    borderRadius: '25px', color: '#fff',
                                    textAlign: 'center', lineHeight: '50px',
                                }
                            ]}
                        >
                            {markers.map((marker) => {
                                const isSelected = marker.id === selectedStationId;
                                const isAvailable = marker.availableCnt > 0;
                                const isInfoWindowOpen = infoWindow && infoWindow.stationId === marker.id;
                                let imgSrc = '/unavailable.png';
                                let imgSize = { width: 12, height: 12 };

                                if (isSelected || isInfoWindowOpen) {
                                    imgSrc = 'isSelected.png'
                                    imgSize = { width: 50, height: 50 };
                                } else if (isAvailable) {
                                    imgSize = { width: 32, height: 32 };
                                    if(marker.changeStatus === 'increase'){
                                        imgSrc = '/available2.png';
                                    } else if (marker.changeStatus === 'decrease'){
                                        imgSrc = '/available2.png';
                                    } else{
                                        imgSrc = '/available.png';
                                    }
                                }

                                return (
                                    // <React.Fragment key={`${marker.id}-${marker.lat}-${marker.lng}`}>
                                        <MapMarker 
                                            key={marker.id}
                                            position={{ lat: marker.lat, lng: marker.lng }}
                                            image={{
                                                src: imgSrc,
                                                size: imgSize,
                                            }}
                                            onClick={()=>handleMarkerClick(marker)}
                                            zIndex={isSelected ? 999 : isAvailable ? 10 : 1}
                                        >
                                        </MapMarker>
                                        
                                )
                            })}
                        </MarkerClusterer>
                        {/* 기본 오버레이 */}
                        {markers.map((marker:MarkerType) => {
                            const show = marker.availableCnt > 0 && marker.id !== selectedStationId && currentZoom < MIN_CLUSTER_LEVEL  && (!infoWindow || infoWindow.stationId !== marker.id);
                            if(show){
                                return (
                                    <CustomOverlayMap
                                        key={marker.id}
                                        position={{ lat: marker.lat, lng: marker.lng }}
                                        yAnchor={1.35}
                                        zIndex={11}
                                    >
                                        <div className="customoverlay">
                                            <div style={{color: 'white', fontSize: '12px', pointerEvents: 'none'}} >
                                                {marker.availableCnt}
                                            </div>
                                        </div>
                                    </CustomOverlayMap>
                                )
                            } else {
                                return null;
                            }
                        })}
                    </>
                }
                
                {/* 선택된 마커 정보창 */}
                {infoWindow && currentZoom < MIN_CLUSTER_LEVEL && (
                    <CustomOverlayMap 
                        position={infoWindow.position} 
                        yAnchor={2.5}
                        zIndex={1000}    
                    >
                        <div className='px-5 py-2 flex gap-2 justify-center bg-[#F7FECD] border-[#CACFAC] rounded-full shadow-lg'>
                            {/* 충전기 타입별 개수 */}
                            {/* 급속 충전기 */}
                                {infoWindow.chargerTypes.fastCount > 0 && (
                                    <div className='text-[12px] font-bold'>
                                        <span className='mr-1'>급</span>
                                        {infoWindow.chargerTypes.fastCount}
                                        <span className='text-[#6b6b6b]'>/{infoWindow.chargerTypes.fastTotal}</span>
                                    </div>
                                )}
                                
                                {/* 중속 충전기 */}
                                {infoWindow.chargerTypes.midCount > 0 && (
                                    <div className='text-[12px] font-bold'>
                                        <span className='mr-1'>중</span>
                                        {infoWindow.chargerTypes.midCount}
                                        <span className='text-[#6b6b6b]'>/{infoWindow.chargerTypes.midTotal}</span>
                                    </div>
                                )}
                                
                                {/* 완속 충전기 */}
                                {infoWindow.chargerTypes.slowCount > 0 && (
                                    <div className='text-[12px] font-bold'>
                                        <span className='mr-1'>완</span>
                                        {infoWindow.chargerTypes.slowCount}
                                        <span className='text-[#6b6b6b]'>/{infoWindow.chargerTypes.slowTotal}</span>
                                    </div>
                                )}
                        </div>
                    </CustomOverlayMap>
                )}
            </Map>
            {isMapMoved && (
                <button
                    // ✨ 상단 중앙 배치 스타일
                    className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center  bg-[#4FA969] px-4 py-2 rounded-full shadow-lg z-10  
                    hover:bg-[#5a9c6d] transition-all duration-300 ease-in-out  text-white font-semibold text-[15px] cursor-pointer"
                    onClick={handleSearchHere}
                >
                    <span className='mb-1 mr-2'><IoRefreshOutline size={20}/></span>
                    현 지도에서 검색
                </button>
            )}

            <button
                className={`absolute bottom-5 right-5 
                            flex items-center  ${showPredictBtn ? 'justify-between' : 'justify-center'}  gap-4
                            bg-white border px-6 py-2 rounded-full shadow-lg z-10 text-[#4FA969] font-bold 
                            hover:bg-gray-100 
                            transition-all duration-300 ease-in-out overflow-hidden`}
                // 2. showPredictBtn 상태에 따라 패딩과 너비를 동적으로 변경
                style={{ 
                    width: showPredictBtn ? '320px' : '150px' // 확장/축소될 너비 지정
                }}
                onClick={()=>setShowPredictBtn(!showPredictBtn)}
            >
                <span>
                    {predictHours === 0 ? '실시간' : `${predictHours}시간 후`}
                </span>
                {showPredictBtn &&
                    <div className={` w-[180px] transition-opacity duration-300 ease-in-out`}>
                        {/* home까지 값이감 */}
                        <TimeFilter value={predictHours} onTimeSelect={onHoursChange} showLabel={false} max={6}/> 
                    </div>
                }
            </button>
            
        </div>
    )
}
