/**
@module MockHandlers
@description API 요청을 가로채서 Dexie DB의 데이터를 반환하는 핸들러 모음입니다.
*/
import { http, HttpResponse } from 'msw';
import { db } from '@/db/db';
import { ChargingStationRequestDto } from '@/types/station/station.request';

export const handlers = [
    /**
     * 충전소 목록 조회 요청
     * 반경 및 필터링 계산 후 반환합니다.
     */
    http.post('*/map/post/stations', async ({ request }) => {
        const filters = (await request.json()) as ChargingStationRequestDto;

        // 1. db에서 데이터 가져옴(전체 or 기본)
        let query = db.stations.toCollection();

        // 2. 필터링
        if (filters.mapQueryDto.parkingFree) {
            query = db.stations.where('parkingFree').equals(true as any);
        }

        if (filters.mapQueryDto.limitYn) {
            query = query.and(station => station.limitYn === true);
        }

        const allData = await query.toArray();

        // 3. 거리 계산 로직 (유닛 테스트)
        const result = allData.filter(station => {
            const distance = calculateDistance(
                filters.coorDinatesDto.lat,
                filters.coorDinatesDto.lon,
                station.lat,
                station.lng
            );
            return distance <= filters.coorDinatesDto.radius;
        });
        return HttpResponse.json(result);
    })
];

/**
 * 하버사인 공식을 이용한 두 좌표 간 거리(m) 계산 함수
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // 지구 반경 (m)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}