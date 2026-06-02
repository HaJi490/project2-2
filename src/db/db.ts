/**
@module Database
@description 브라우저 내장 데이터베이스(IndexedDB) 설정을 관리합니다.
부산 전체 충전소 데이터를 저장하고 필터링 쿼리를 수행합니다.
*/
import Dexie, {Table} from 'dexie';
import { BaseChargingStationDto } from '@/types/station/station.response';

export class EVChargeDB extends Dexie {
    // stations 테이블 정의
    stations!: Table<BaseChargingStationDto>;

    constructor() {
        super('EVChargeDB');
        this.version(1).stores({
            // 인덱싱할 필드 정의
            stations: 'statId, statNm, addr, busiId, parkingFree, limitYn, lat, lng'
        });
    }
}

export const db = new EVChargeDB();