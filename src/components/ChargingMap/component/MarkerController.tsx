import React from 'react'
import { MapMarker, MarkerClusterer } from 'react-kakao-maps-sdk';

interface MarkerControllerProps{
    markers: MarkerType[];
    selectedStationId?: string | null;
    currentZoom: number;
    MIN_CLUSTER_LEVEL: number;
}

type MarkerType = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    availableCnt: number;
};

export default function MarkerController({markers, selectedStationId, currentZoom, MIN_CLUSTER_LEVEL}: MarkerControllerProps) {
    return (
        // {/* 마커 클러스터러 */}
        <MarkerClusterer 
            key={mapCenter?.join('-')}
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
                return (
                    // <React.Fragment key={marker.id}>
                        <MapMarker 
                            key={marker.id}
                            position={{ lat: marker.lat, lng: marker.lng }}
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
                )
            })}
        </MarkerClusterer>
)
}
