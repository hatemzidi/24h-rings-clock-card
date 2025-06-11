// src/const.ts

export const CARD_NAME = '24-HOUR-CLOCK-CARD';
export const CARD_VERSION = '4.0.0';

// Default configuration values
export const DEFAULT_SUN_ENTITY = 'sun.sun';
export const DEFAULT_CIRCLE = 'circle1';
export const DEFAULT_ACCENT_COLOR = '#03a9f4';
export const DEFAULT_SUNSET_COLOR = '#FFD700';

// Stub configuration range values (used in getStubConfig)
export const STUB_TITLE = '24-Hour Clock';
export const STUB_RANGE_1_START_TIME = 'input_datetime.start_time';
export const STUB_RANGE_1_END_TIME = 'input_datetime.end_time';
export const STUB_RANGE_1_CIRCLE = 'circle1';
export const STUB_RANGE_1_COLOR = '#03a9f4';

export const STUB_RANGE_2_START_TIME = '06:00';
export const STUB_RANGE_2_END_TIME = '18:00';
export const STUB_RANGE_2_CIRCLE = 'circle2';
export const STUB_RANGE_2_COLOR = '#FFD700';


// Clock update interval in milliseconds
export const CLOCK_UPDATE_INTERVAL_MS = 60000; // 1 minute