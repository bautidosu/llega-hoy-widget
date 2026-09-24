import test from 'node:test';import assert from 'node:assert/strict';import {nextDelivery,countdown,deliveryLabel} from '../lib/delivery.mjs';
const cfg={cutoff:'12:00',days:[1,2,3,4,5,6]};
test('before cutoff arrives today',()=>{const r=nextDelivery(new Date(2026,8,24,11,30,0),cfg);assert.equal(r.status,'today');assert.equal(r.seconds,1800)});
test('after cutoff arrives tomorrow when enabled',()=>{const r=nextDelivery(new Date(2026,8,24,12,0,0),cfg);assert.equal(r.status,'tomorrow');assert.equal(deliveryLabel(r),'Llega mañana')});
test('Saturday after cutoff skips Sunday',()=>{const r=nextDelivery(new Date(2026,8,26,13,0,0),cfg);assert.equal(r.status,'later');assert.equal(r.date.getDay(),1)});
test('blocked date skipped',()=>{const r=nextDelivery(new Date(2026,8,24,13,0,0),{...cfg,blockedDates:['2026-09-25']});assert.equal(r.status,'later');assert.equal(r.date.getDate(),26)});
test('countdown formats seconds during final hour',()=>{assert.equal(countdown(59*60+37),'59:37');assert.equal(countdown(2*3600+30*60),'2h 30m')});
test('no delivery days does not promise delivery',()=>{assert.equal(nextDelivery(new Date(),{...cfg,days:[]}).status,'unavailable')});
