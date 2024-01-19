export type CheckConsentApplicationResponse = '00' | '01' | '02' | '03' | '04' | '05';

export const CheckConsentApplicationErrorResponse = {
  '00': "同意申込が存在しない",
  '01': "全ての結果がOK",
  '02': "審査が未完了",
  '03': "本人確認結果がNG",
  '04': "地点確認結果がNG",
  '05': "契約照合結果がNG",
};
