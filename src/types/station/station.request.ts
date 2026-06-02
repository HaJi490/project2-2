/**
 * @module StationRequest
 * @description 충전소 API 서버로 요청하는 데이터 구조 정의 (DTO)
 * 1. StationDetailResponse: 충전소 상세 정보 응답
 * 2. ChargerInfo: 개별 충전기 상태 데이터
 */

// 📍전기차충전소 요청dto
export interface CoordinatesDto {
    lat: number;
    lon: number;
    radius: number;
}

export interface MapQueryDto {
    useMap: boolean;
    limitYn: boolean;
    parkingFree: boolean;
    canUse: boolean;
    outputMin: number;
    outputMax: number;
    busiId: string[];     // 사업자 ID 리스트
    chgerType: string[];  // 충전기 타입 리스트
    keyWord?: string;
}

export interface ChargingStationRequestDto {
    coorDinatesDto: CoordinatesDto;
    mapQueryDto: MapQueryDto;
}

// n시간후 전기차충전소 요청dto
export interface ChargingStationPredictionRequestDto {
    coorDinatesDto: CoordinatesDto;
    mapQueryDto: MapQueryDto;
    time: Date;
}
