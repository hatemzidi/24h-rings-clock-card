// src/style.ts

export const cardStyle = `
    :host {
        display: block;
        background: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.1));
        padding: 20px;
        font-family: var(--paper-font-body1_-_font-family);
        color: var(--primary-text-color);
    }

    .card-header {
        font-size: 1.2em;
        font-weight: 500;
        margin-bottom: 16px;
        text-align: center;
        color: inherit;
    }

    .clock-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .clock {
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: var(--card-background-color, #fff);
        border: 2px solid var(--divider-color, #e0e0e0);
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        margin: 0 auto;
        flex-shrink: 0;
    }

    .clock-face {
        width: 380px;
        height: 380px;
        border-radius: 50%;
        position: relative;
        background: var(--card-background-color, #fff);
    }

    .hour-marker {
        position: absolute;
        width: 2px;
        height: 10px;
        background: var(--secondary-text-color, #666);
        left: 50%;
        top: 5px;
        transform-origin: 50% 185px;
        transform: translateX(-50%);
    }

    .hour-marker.major {
        width: 3px;
        height: 20px;
        background: var(--primary-text-color, #333);
        top: 5px;
    }

    .hour-number {
        position: absolute;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #333);
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        left: 50%;
        top: 30px;
        transform-origin: 50% 160px;
        transform: translateX(-50%);
        user-select: none;
    }

    .hour-number span {
        display: block;
        width: 100%;
        text-align: center;
    }

    .circle1, .circle2, .circle3, .circle4 {
        position: absolute;
        border-radius: 50%;
        border: 1px dashed var(--divider-color, #e0e0e0);
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .circle1 { width: 290px; height: 290px; }
    .circle2 { width: 270px; height: 270px; }
    .circle3 { width: 250px; height: 250px; }
    .circle4 { width: 230px; height: 230px; }

    .arc {
        position: absolute;
        border-radius: 50%;
        border: 5px solid transparent;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        mask: radial-gradient(transparent calc(50% - 5px), black calc(50% - 4px), black calc(50% + 4px), transparent calc(50% + 5px));
        -webkit-mask: radial-gradient(transparent calc(50% - 5px), black calc(50% - 4px), black calc(50% + 4px), transparent calc(50% + 5px));
    }

    .arc.circle1 { width: 290px; height: 290px; }
    .arc.circle2 { width: 270px; height: 270px; }
    .arc.circle3 { width: 250px; height: 250px; }
    .arc.circle4 { width: 230px; height: 230px; }

    .hour-hand {
        position: absolute;
        width: 6px;
        height: 100px;
        background: var(--accent-color, #03a9f4);
        left: 50%;
        top: 50%;
        transform-origin: 50% 100%;
        transform: translateX(-50%) translateY(-100%);
        border-radius: 3px;
        transition: transform 0.1s linear;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .center-dot {
        position: absolute;
        width: 12px;
        height: 12px;
        background: var(--accent-color, #03a9f4);
        border-radius: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 8px rgba(0,0,0,0.2);
    }

    .sun-marker {
        position: absolute;
        font-size: 16px;
        color: var(--accent-color, #FFA500);
        left: 50%;
        top: 5px;
        transform-origin: 50% 185px;
        transform: translateX(-50%);
        font-weight: bold;
        pointer-events: none;
        background: var(--card-background-color, #fff);
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 0 5px rgba(0,0,0,0.3);
    }

    .sun-marker span {
        display: block;
        transform: translateY(1px);
    }

    @media (max-width: 480px) {
        .clock {
            width: 300px;
            height: 300px;
        }
        
        .clock-face {
            width: 280px;
            height: 280px;
        }
        
        .hour-number {
            font-size: 11px;
            transform-origin: 50% 115px;
            top: 25px;
        }
        
        .hour-hand {
            height: 70px;
        }

        .hour-marker {
            transform-origin: 50% 135px;
            height: 8px;
        }

        .hour-marker.major {
            transform-origin: 50% 135px;
            height: 15px;
        }

        .circle1, .arc.circle1 { width: 220px; height: 220px; }
        .circle2, .arc.circle2 { width: 200px; height: 200px; }
        .circle3, .arc.circle3 { width: 180px; height: 180px; }
        .circle4, .arc.circle4 { width: 160px; height: 160px; }

        .sun-marker {
            transform-origin: 50% 135px;
            font-size: 14px;
            width: 18px;
            height: 18px;
        }
    }
`;