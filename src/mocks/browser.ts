/**
 * @module MSWBrowser
 * @description 브라우저 환경에서 API 모킹을 활성화하기 위한 MSW 워커 설정
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);