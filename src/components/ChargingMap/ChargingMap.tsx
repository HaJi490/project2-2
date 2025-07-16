'use client'

import React, { useEffect, useState } from 'react'
import { Map, MapMarker, useKakaoLoader, CustomOverlayMap, Circle, MarkerClusterer } from 'react-kakao-maps-sdk'

interface ChargingMapProps {
    myPos: [number, number] | null;
    markers: MarkerType[];
    radius: number;
    selectedStationId?: string | null;
    posHere: (center: { lat: number; lng: number }) => void;
    mapCenter: [number, number] | null;
}

type MarkerType = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    availableCnt: number;
};

// 마커 클릭 시 정보창을 관리하기 위한 상태
type InfoWindowState = {
    position: {
        lat: number;
        lng: number;
    },
    content: string;
    stationId: string;
} | null;


export default function ChargingMap({ myPos, radius, mapCenter, markers, selectedStationId, posHere }: ChargingMapProps) {
    const [map, setMap] = useState<kakao.maps.Map>(); // 지도인스턴스 저장
    // const [infoWindow, setInfoWindow] = useState<InfoWindowState>(null);
    const [currentZoom, setCurrentZoom] = useState(5);

    const MIN_CLUSTER_LEVEL = 6; // 클러스터링 최소레벨

    // 1. Hook을 이용하여 Kakao맵 불러오기
    const [loading, error] = useKakaoLoader({
        appkey: process.env.NEXT_PUBLIC_KAKAO_JSKEY!, //non-null 추가
        libraries: ["clusterer", "services"],
    });

    // 2. 선택된 충전소 변경시 지도중심 이동 및 확대- mapCenter
    useEffect(() => {
        if (!map || !selectedStationId) return;

        const selectedMarker = markers.find(marker => marker.id === selectedStationId);

        if (selectedMarker) {
            const position = new kakao.maps.LatLng(selectedMarker.lat, selectedMarker.lng);
            map.setLevel(3, { anchor: position }); // 레벨 3으로 확대
            map.panTo(position); // 부드럽게 이동
        }


    }, [selectedStationId, map, markers]);

    // 3. mapCenter prop변경시 지도 중심 이동
    useEffect(() => {
        if (map && mapCenter) {
            console.log('[mapCenter]', mapCenter);
            // 새로운 좌표객체
            const moveLatLon = new kakao.maps.LatLng(mapCenter[0], mapCenter[1]);

            // 부드럽게 지도 이동
            map.panTo(moveLatLon);
        }
    }, [mapCenter, map])

    // 4. '현지도에서 검색' 핸들러
    const handleSearchHere = () => {
        if (map) {
            const center = map.getCenter();
            posHere({ lat: center.getLat(), lng: center.getLng() }); // 부모로 전달 // ❗ 전달방식 바뀜(center->lat, lng)
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
            >
                {/* 내 위치기분 반경 - 🙆‍♀️ */}
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
                        <MarkerClusterer averageCenter={true}   // 클러스터 마커를 평균 위치로 설정
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
                                const isAvailable = marker.availableCnt > 0
                                let imgSrc = '/unavailable.png';
                                let imgSize = { width: 12, height: 12 };

                                if (isSelected) {
                                    imgSrc = 'isSelected.png'
                                    imgSize = { width: 50, height: 50 };
                                } else if (isAvailable) {
                                    imgSrc = '/available.png';
                                    imgSize = { width: 32, height: 32 };
                                }

                                // 디버깅코드
                                // console.log(`Marker ID: ${marker.id}, currentZoom: ${currentZoom}, isAvailable: ${isAvailable}, isSelected: ${isSelected}, Condition: ${isAvailable && !isSelected && currentZoom < MIN_CLUSTER_LEVEL}`);


                                return (
                                    <React.Fragment key={marker.id}>
                                        <MapMarker position={{ lat: marker.lat, lng: marker.lng }}
                                            image={{
                                                src: imgSrc,
                                                size: imgSize,
                                            }}
                                            // onClick={()=>{
                                            //     if(isSelected){
                                            //         setInfoWindow(null);    // 이미 선택된 마커 클릭시 정보창 닫기--?왜닫아
                                            //     }else{
                                            //         setInfoWindow({
                                            //             position: {lat: marker.lat, lng: marker.lng},
                                            //             content: marker.name,
                                            //             stationId: marker.id,
                                            //         })
                                            //     }
                                            // }}
                                            zIndex={isSelected ? 999 : 1}
                                        >
                                            {/* <div>{pos.availableCnt}</div> */}
                                        </MapMarker>
                                        
                                        {/* )} */}
                                    </React.Fragment>
                                )
                            })}
                        </MarkerClusterer>
                        {/* 기본 오버레이 */}
                        {markers.map((marker:MarkerType) => {
                            const show = marker.availableCnt > 0 && marker.id === selectedStationId && currentZoom < MIN_CLUSTER_LEVEL;
                            if(show){
                                return (
                                    <CustomOverlayMap
                                        position={{ lat: marker.lat, lng: marker.lng }}
                                        yAnchor={1.2}
                                    >
                                        <div className="customoverlay">
                                            {/* ++클릭했을때 해당페이지로 이동가능 */}
                                            {/* <a
                                            href="https://map.kakao.com/link/map/11394059"
                                            target="_blank"
                                            rel="noreferrer"
                                            > */}

                                            <div className="text-red" style={{ zIndex: 10 }}>
                                                {marker.availableCnt}
                                            </div>
                                            {/* </a> */}
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
                {/* {infoWindow && selectedStationId === infoWindow.stationId &&(
                    <CustomOverlayMap position={infoWindow.position} yAnchor={1.8}>
                        <div className='p-3 bg-white border rounded-lg shadow-lg min-w-[200px]'>
                            <div className='font-bold'> {infoWindow.content}</div>
                        </div>
                    </CustomOverlayMap>
                )} */}
            </Map>
            <button
                className="absolute bottom-4 right-4 bg-white border px-4 py-2 rounded shadow-lg z-10 hover:bg-gray-100 transition-colors"
                onClick={handleSearchHere}
            >
                현 지도에서 검색
            </button>
        </div>
    )
}
