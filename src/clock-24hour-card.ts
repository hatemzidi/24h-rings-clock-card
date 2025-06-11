// src/clock-24hour-card.ts

import { cardStyle } from './style';
import {
    CARD_NAME,
    CARD_VERSION,
    DEFAULT_SUN_ENTITY,
    DEFAULT_CIRCLE,
    DEFAULT_ACCENT_COLOR,
    CLOCK_UPDATE_INTERVAL_MS,
    STUB_TITLE,
    STUB_RANGE_1_START_TIME,
    STUB_RANGE_1_END_TIME,
    STUB_RANGE_1_CIRCLE,
    STUB_RANGE_1_COLOR,
    STUB_RANGE_2_START_TIME,
    STUB_RANGE_2_END_TIME,
    STUB_RANGE_2_CIRCLE,
    STUB_RANGE_2_COLOR,
    DEFAULT_SUNSET_COLOR
} from './const';

interface Time {
    hours: number;
    minutes: number;
}

interface RangeConfig {
    start_time: string;
    end_time: string;
    circle?: 'circle1' | 'circle2' | 'circle3' | 'circle4';
    color?: string;
}

interface ClockCardConfig {
    title?: string;
    sun_entity?: string;
    ranges?: RangeConfig[];
}

interface HomeAssistant {
    states: {
        [entityId: string]: {
            state: string;
            attributes: {
                next_rising?: string;
                next_setting?: string;
                [key: string]: any;
            };
            [key: string]: any;
        };
    };
    [key: string]: any;
}

declare global {
    interface Window {
        customCards: {
            type: string;
            name: string;
            description: string;
        }[];
    }
}

class Clock24HourCard extends HTMLElement {
    private config!: ClockCardConfig;
    private ranges: RangeConfig[] = [];
    private sunEntity: string = DEFAULT_SUN_ENTITY; // Use constant here
    private _hass: HomeAssistant | undefined;
    private clockInterval: number | null = null;

    // DOM Elements
    private clockFace!: HTMLElement;
    private sunriseMarker!: HTMLElement;
    private sunsetMarker!: HTMLElement;
    private hourHand!: HTMLElement;
    private centerDot!: HTMLElement;
    private arcElements: { element: HTMLElement; range: RangeConfig }[] = [];


    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.updateClock = this.updateClock.bind(this);
        this.updateSunMarkers = this.updateSunMarkers.bind(this);
    }

    public setConfig(config: ClockCardConfig): void {
        if (!config) {
            throw new Error('Invalid configuration');
        }
        this.config = config;
        this.ranges = config.ranges || [];
        this.sunEntity = config.sun_entity || DEFAULT_SUN_ENTITY; // Use constant here
        this.render();
    }

    public set hass(hass: HomeAssistant) {
        this._hass = hass;
        this.updateClock();
        this.updateSunMarkers();
    }

    private render(): void {
        this.shadowRoot!.innerHTML = `
            <style>
                ${cardStyle}
            </style>
            
            ${this.config.title ? `<div class="card-header">${this.config.title}</div>` : ''}
            <div class="clock-container">
                <div class="clock">
                    <div class="clock-face" id="clockFace">
                        <div class="circle1"></div>
                        <div class="circle2"></div>
                        <div class="circle3"></div>
                        <div class="circle4"></div>
                    </div>
                </div>
            </div>
        `;

        this.clockFace = this.shadowRoot!.getElementById('clockFace') as HTMLElement;

        this.createHourMarkers();
        this.createArcs();
        this.createSunMarkers();
        this.createHourHandAndCenterDot();

        this.startClock();
    }

    private createHourMarkers(): void {
        const fragment = document.createDocumentFragment();
        for (let hour = 0; hour < 24; hour++) {
            const marker = document.createElement('div');
            marker.className = hour % 6 === 0 ? 'hour-marker major' : 'hour-marker';
            marker.style.transform = `translateX(-50%) rotate(${hour * 15}deg)`;
            fragment.appendChild(marker);

            const hourNumber = document.createElement('div');
            hourNumber.className = 'hour-number';
            hourNumber.style.transform = `translateX(-50%) rotate(${hour * 15}deg)`;

            const textSpan = document.createElement('span');
            textSpan.textContent = hour.toString().padStart(2, '0');
            textSpan.style.transform = `rotate(${-hour * 15}deg)`;

            hourNumber.appendChild(textSpan);
            fragment.appendChild(hourNumber);
        }
        this.clockFace.appendChild(fragment);
    }

    private createArcs(): void {
        this.arcElements = [];
        const fragment = document.createDocumentFragment();

        this.ranges.forEach((range, index) => {
            const arc = document.createElement('div');
            arc.className = `arc ${range.circle || DEFAULT_CIRCLE}`; // Use constant here
            arc.id = `arc-${index}`;
            fragment.appendChild(arc);
            this.arcElements.push({ element: arc, range: range });
            this.updateArc(arc, range);
        });
        this.clockFace.appendChild(fragment);
    }

    private createSunMarkers(): void {
        this.sunriseMarker = document.createElement('div');
        this.sunriseMarker.className = 'sun-marker';
        this.sunriseMarker.id = 'sunrise-marker';
        this.sunriseMarker.innerHTML = '<span>↑</span>';
        this.clockFace.appendChild(this.sunriseMarker);

        this.sunsetMarker = document.createElement('div');
        this.sunsetMarker.className = 'sun-marker';
        this.sunsetMarker.id = 'sunset-marker';
        this.sunsetMarker.innerHTML = '<span>↓</span>';
        this.clockFace.appendChild(this.sunsetMarker);
    }

    private createHourHandAndCenterDot(): void {
        this.hourHand = document.createElement('div');
        this.hourHand.className = 'hour-hand';
        this.hourHand.id = 'hourHand';
        this.clockFace.appendChild(this.hourHand);

        this.centerDot = document.createElement('div');
        this.centerDot.className = 'center-dot';
        this.centerDot.id = 'centerDot';
        this.clockFace.appendChild(this.centerDot);
    }

    private updateArc(arcElement: HTMLElement, range: RangeConfig): void {
        const startTime = this.parseTime(range.start_time);
        const endTime = this.parseTime(range.end_time);

        if (!startTime || !endTime) {
            arcElement.style.background = 'transparent';
            return;
        }

        const startAngle = this.timeToAngle(startTime);
        let endAngle = this.timeToAngle(endTime);

        if (endAngle < startAngle) {
            endAngle += 360;
        }

        const arcLength = endAngle - startAngle;

        const color = range.color || DEFAULT_ACCENT_COLOR; // Use constant here

        arcElement.style.background = `conic-gradient(from ${startAngle}deg, transparent 0deg, ${color} 0deg, ${color} ${arcLength}deg, transparent ${arcLength}deg)`;
    }

    private parseTime(timeInput: string): Time | null {
        if (!timeInput) return null;

        let timeStr = timeInput;

        if (typeof timeInput === 'string' && timeInput.includes('.')) {
            const entityState = this._hass?.states[timeInput];
            if (entityState && entityState.state !== 'unavailable' && entityState.state !== 'unknown') {
                timeStr = entityState.state;
            } else {
                return null;
            }
        }

        const parts = timeStr.split(':').map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { hours: parts[0], minutes: parts[1] };
        }

        return null;
    }

    private timeToAngle(time: Time): number {
        return (time.hours * 15) + (time.minutes * 0.25);
    }

    private updateClock(): void {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const totalMinutes = hours * 60 + minutes + seconds / 60;
        const hourAngle = (totalMinutes / (24 * 60)) * 360;

        if (this.hourHand) {
            this.hourHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`;
        }

        if (this._hass) {
            this.arcElements.forEach(({ element, range }) => {
                this.updateArc(element, range);
            });
        }
    }

    private updateSunMarkers(): void {
        if (!this._hass || !this.sunEntity || !this._hass.states[this.sunEntity]) {
            if (this.sunriseMarker) this.sunriseMarker.style.display = 'none';
            if (this.sunsetMarker) this.sunsetMarker.style.display = 'none';
            return;
        }

        const sunState = this._hass.states[this.sunEntity];
        const attributes = sunState.attributes;

        if (attributes.next_rising && attributes.next_setting) {
            const sunrise = new Date(attributes.next_rising);
            const sunset = new Date(attributes.next_setting);

            if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
                if (this.sunriseMarker) this.sunriseMarker.style.display = 'none';
                if (this.sunsetMarker) this.sunsetMarker.style.display = 'none';
                return;
            }

            if (this.sunriseMarker) this.sunriseMarker.style.display = '';
            if (this.sunsetMarker) this.sunsetMarker.style.display = '';

            const sunriseAngle = this.dateToAngle(sunrise);
            const sunsetAngle = this.dateToAngle(sunset);

            if (this.sunriseMarker) {
                this.sunriseMarker.style.transform = `translateX(-50%) rotate(${sunriseAngle}deg)`;
                (this.sunriseMarker.querySelector('span') as HTMLElement).style.transform = `rotate(${-sunriseAngle}deg)`;
            }

            if (this.sunsetMarker) {
                this.sunsetMarker.style.transform = `translateX(-50%) rotate(${sunsetAngle}deg)`;
                (this.sunsetMarker.querySelector('span') as HTMLElement).style.transform = `rotate(${-sunsetAngle}deg)`;
            }
        } else {
            if (this.sunriseMarker) this.sunriseMarker.style.display = 'none';
            if (this.sunsetMarker) this.sunsetMarker.style.display = 'none';
        }
    }

    private dateToAngle(date: Date): number {
        return this.timeToAngle({ hours: date.getHours(), minutes: date.getMinutes() });
    }

    private startClock(): void {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }

        this.clockInterval = window.setInterval(() => {
            this.updateClock();
            this.updateSunMarkers();
        }, CLOCK_UPDATE_INTERVAL_MS); // Use constant here
    }

    public disconnectedCallback(): void {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
    }

    public static getStubConfig(): ClockCardConfig {
        return {
            title: STUB_TITLE, // Use constant
            sun_entity: DEFAULT_SUN_ENTITY, // Use constant
            ranges: [
                {
                    start_time: STUB_RANGE_1_START_TIME, // Use constant
                    end_time: STUB_RANGE_1_END_TIME,     // Use constant
                    circle: STUB_RANGE_1_CIRCLE,         // Use constant
                    color: STUB_RANGE_1_COLOR            // Use constant
                },
                {
                    start_time: STUB_RANGE_2_START_TIME, // Use constant
                    end_time: STUB_RANGE_2_END_TIME,     // Use constant
                    circle: STUB_RANGE_2_CIRCLE,         // Use constant
                    color: STUB_RANGE_2_COLOR            // Use constant
                }
            ]
        };
    }
}

customElements.define('clock-24hour-card', Clock24HourCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'clock-24hour-card',
    name: '24-Hour Clock Card',
    description: 'Enhanced 24-hour analog clock with time ranges and sun tracking'
});

console.info(
    `%c${CARD_NAME} %c${CARD_VERSION}`,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
);