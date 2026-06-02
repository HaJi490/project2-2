'use client'

import { useEffect, useState } from "react"
import { db } from "@/db/db"
import { onUnhandledRequest } from "msw";
import LottieLoading from "./LottieLoading";

/**
 * 앱 켜질 때 딱 한번 환경 세팅하는 컴포넌트
 */
export default function Initializer({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);


    useEffect(async() => {
        //  await db.stations.clear();
        if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
            setIsReady(true);
            return;
        }

        const init = async () => {
            // 1. MSw 활성화
            const { worker } = await import('@/mocks/browser');
            await worker.start({ onUnhandledRequest: 'bypass' });

            // 2. DexieDB 데이터 유무 확인
            const count = await db.stations.count();
            if (count === 0) {
                console.log('데이터가 없습니다. 초기화를 시작합니다.');
                try {
                    // 3. public/data/busan.json 읽기
                    const resp = await fetch('/data/busan_stations.json');
                    const rawData: any[] = await resp.json();

                    // 현재 날짜 기준점으로 설정
                    const sourceReferenceData = new Date(2025, 7, 8, 15, 0, 0).getTime();
                    const now = new Date().getTime();

                    // 현재-과거 차이
                    const timeOffset = now - sourceReferenceData;

                    // 4. 데이터 정규화(Y/N -> bool/Record 처리)
                    const normalizeData = rawData.map(station => {
                        const updatedChargerInfo = Object.fromEntries(
                            Object.entries(station.chargerInfo).map(([id, charger]: [string, any]) => {
                                const ts = charger.lastTsdt;
                                const originalDate = new Date(
                                    parseInt(ts.slice(0, 4)),
                                    parseInt(ts.slice(4, 6)) - 1,
                                    parseInt(ts.slice(6, 8)),
                                    parseInt(ts.slice(8, 10)),
                                    parseInt(ts.slice(10, 12)),
                                    parseInt(ts.slice(12, 14))
                                ).getTime();
                                const newDate = new Date(originalDate + timeOffset);

                                const newTsdt =
                                    newDate.getFullYear().toString() +
                                    (newDate.getMonth() + 1).toString().padStart(2, '0') +
                                    newDate.getDate().toString().padStart(2, '0') +
                                    newDate.getHours().toString().padStart(2, '0') +
                                    newDate.getMinutes().toString().padStart(2, '0') +
                                    newDate.getSeconds().toString().padStart(2, '0');
                                console.log('새로 계산된 시간', newTsdt);
                                return [id, { ...charger, lastTsdt: newTsdt }];
                            })
                        );
                        return {
                            ...station,
                            parkingFree: station.parkingFree === true || station.parkingFree === 'Y',
                            limitYn: station.limitYn === true || station.limitYn === 'Y',
                            chargerInfo: updatedChargerInfo
                        }
                    }

                    );


                    // 5. DB에 대량 삽입 (bulkAdd)
                    await db.stations.bulkAdd(normalizeData);
                    console.log('데이터 초기화 완료')
                } catch (error) {
                    console.error('데이터 로드 실패: ', error)
                }
            }
            setIsReady(true);
        }

        init();
    }, []);

    if (!isReady) return <div className='w-full h-screen flex justify-center items-center bg-black/30'><LottieLoading /></div>

    return <>{children}</>
}
