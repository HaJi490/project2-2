/**
 * @module StationResponse
 * @description 충전소 API 서버로부터 수신하는 데이터 구조 정의 (DTO)
 * 1. StationDetailResponse: 충전소 상세 정보 응답
 * 2. ChargerInfo: 개별 충전기 상태 데이터
 */

// 전기차충전소 응답dto
export interface ChargerInfoItem {
    statNm: string;
    statId: string;
    chgerId: string;
    chgerType: string;
    addr: string;
    lat: number;
    lng: number;
    useTime: string;
    location: string | null;
    startUpdatetime: string | null;
    stat: string;
    statUpdDt: string;
    lastTsdt: string;
    lastTedt: string;
    nowTsdt: string;
    output: string;
    method: string;
    kind: string;
    kindDetail: string;
    parkingFree: string;
    note: string;
    limitYn: string;
    limitDetail: string;
    delYn: string;
    busiId: string;
    busiNm: string;
}

// 충전소 공통정보
export interface BaseChargingStationDto {
    statNm: string;
    statId: string;
    addr: string;
    lat: number;
    lng: number;
    parkingFree: boolean;
    limitYn: boolean;
    totalChargeNum: number;
    totalFastNum: number;
    totalSlowNum: number;
    chargeFastNum: number;
    chargeSlowNum: number;
    totalMidNum: number;
    chargeMidNum: number;
    chargeNum: number;
    enabledCharger: string[];
    busiId: string;
    busiNm: string;
    chargerInfo: Record<string, ChargerInfoItem>; 
    useTime: string;

    bestChoice: string | null; // 실제 타입에 맞게 수정하세요.
    leastDis: number | null;   // 실제 타입에 맞게 수정하세요.
    leashTime: number | null;  // 실제 타입에 맞게 수정하세요.
    canLongUse: any | null; // 실제 타입에 맞게 수정하세요.

    // 👇 예측 DTO에 있던
    totalNacsNum: number;
    chargingDemand: number;
}

// (Member) 현재 충전소 응답 DTO
export interface ChargingStationResponseDto extends BaseChargingStationDto {
}

// // (Member) N시간 후 예측 충전소 응답 DTO
export interface ChargingStationPredictionResponseDto extends BaseChargingStationDto {
    // 예측 DTO에만 있는 속성만 여기에 추가합니다.
    // totalNacsNum: number;
    // chargingDemand: number;
}
// // (Member) 리스트 패널의 아이템을 위한 새로운 타입을 선언합니다.
export interface StationListItem extends ChargingStationResponseDto {
    // changeStatus: 'increase' | 'decrease' | 'same' | 'none';
    predTag: string;
    minute: number; // 소요시간
}

// (Member) 예측응답 dto ver.2
export interface RecommendedStationDto extends BaseChargingStationDto {
    minute: number;
    predTag: string;
    bestChoice: string | null;
    totalNacsNum: number;
    chargingDemand: number;
}