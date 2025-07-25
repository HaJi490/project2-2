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
    time: string;
}

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

export interface ChargerInfoMap {
    [chgerId: string]: ChargerInfoItem;
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
    chargerInfo: Record<string, ChargerInfoItem>; //ChargerInfoMap;
    useTime: string;
}

// (Member) 현재 충전소 응답 DTO
export interface ChargingStationResponseDto extends BaseChargingStationDto {
    // 추가되는 속성이 없으므로 비워둡니다.
}

// (Member) N시간 후 예측 충전소 응답 DTO
export interface ChargingStationPredictionResponseDto extends BaseChargingStationDto {
    // 예측 DTO에만 있는 속성만 여기에 추가합니다.
    totalNacsNum: number;
    chargingDemand: number;
}

// (Member) 리스트 패널의 아이템을 위한 새로운 타입을 선언합니다.
export interface StationListItem extends ChargingStationResponseDto {
    changeStatus: 'increase' | 'decrease' | 'same' | 'none';
}

// (Manager) 대시보드 히트맵 응답
export interface ActualChargingStationData {
    statNm: string;
    statId: string;
    addr: string;
    // useTime은 문자열일 수도, null일 수도 있습니다.
    useTime: string | null;
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
    // 새로 추가된 필드
    totalNacsNum: number; 
    // 새로 추가된 필드
    chargingDemand: number;
    chargeNum: number;
    // enabledCharger는 문자열 배열이거나 null일 수 있습니다.
    enabledCharger: string[] | null;
    busiId: string;
    busiNm: string;
    // chargerInfo는 객체이거나 null일 수 있습니다.
    // ChargerInfoItem 타입을 모르므로 우선 'any'로 지정하고,
    // 나중에 정확한 타입으로 교체하는 것을 권장합니다.
    chargerInfo: Record<string, any> | null; 
}

// 📍회원가입 reqest
export interface SignupRequest {
    username: string;
    nickname: string;
    password: string;
    phoneNumber: string;
    email: string;
    sex: 'male' | 'female' | undefined;
    zipcode?: string; // 선택 입력이므로 optional로 처리
    roadAddr?: string; // 선택 입력이므로 optional로 처리
    detailAddr?: string; // 선택 입력이므로 optional로 처리
    createAt: string | Date; // Date 객체일 수도 있고, ISO 문자열일 수도 있음
}


// 예약현황 request
export interface ReservationStatusRequestDto {
    statId: string;
    date: string;      // 예: "2025-07-06"
    chgerId: string;
}

// 예약현황 response
export interface TimeInfo {
    statId: string;
    chgerId: string;
    timeId: number;
    date: string;         // 예: "2025-07-06"
    startTime: string;    // 예: "00:00:00"
    endTime: string;      // 예: "00:29:59"
    enabled: boolean;
}

// 마이페이지 - 회원정보
export interface User {
    username: string;         // 사용자 아이디
    nickname: string;         // 닉네임
    password: string | null;  // 비밀번호 (null 허용)
    phoneNumber: string;      // 전화번호
    email: string;            // 이메일
    sex: 'male' | 'female';   // 성별
    address: string;          // 주소
    enabled: boolean;         // 활성화 여부
    createAt: string;         // 생성일시 (ISO 형식 문자열)
};


// 마이페이지 - 충전히스토리
// 충전히스토리 타입 선언
export interface ChargingHistoryItem {
    statNm: string;            // 충전소 이름
    chgerId: string;           // 충전기 ID
    chargeDate: string;        // 충전 날짜 (YYYY.MM.DD)
    chargeSTime: string;       // 충전 시작 시간 (HH:mm)
    chargeETime: string;       // 충전 완료 시간 (HH:mm)
    chargeAmount: number;      // 충전량 (kWh)
    chargeCost: number;        // 충전 금액
    chargeDuration: number;    // 충전 시간 (분)
    isReserved: boolean;       // 예약 여부
    reservedSTime: string;     // 예약 시작 시간 (HH:mm)
    reservedETime: string;     // 예약 완료 시간 (HH:mm)
    chgerType: string;         // 충전기 종류
    busiNm: string;            // 사업자명
    // 결제수단, 충전기위치 등 추가 가능
};

export interface History {
    monthlyChargeCount: number;           // 월 충전 횟수
    monthlyChargeAmount: number;          // 월 충전량 (kWh)
    monthlyChargeCost: number;            // 월 충전 금액
    chargingHistory: ChargingHistoryItem[]; // 충전 내역 리스트
};


