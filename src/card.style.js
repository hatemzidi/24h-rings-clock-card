import { css } from 'lit';

export default css`
    ha-card {
        padding: 0 16px;
    }

    .hidden {
      display: none !important;
    }               

    .card-header {
        display: flex; 
        justify-content: space-between; /* Space out title and icon */
        align-items: center; 
        padding-top: 10px;
        color: inherit;
        font-size: 1.2em;
        font-weight: var(--mcg-title-font-weight, 500);
    }

    .card-title-text {
        flex-grow: 1; /* Allow text to take available space */
        text-align: left;
        padding-right: 10px; /* Space between title and icon */
    }

    .card-header-icon ha-icon {
        --mdc-icon-size: 24px; /* Adjust icon size */
        color: var(--primary-text-color, #333); /* Icon color */
    }


    .clock-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 10px 0;
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

    .hour_marker {
        position: absolute;
        width: 2px;
        height: 10px;
        background: var(--secondary-text-color, #666);
        left: 50%;
        top: 5px;
        transform-origin: 50% 185px;
        transform: translateX(-50%);
    }

    .hour_marker.major {
        width: 3px;
        height: 20px;
        background: var(--primary-text-color, #333);
        top: 5px;
    }

    .hour_number {
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

    .hour_number span {
        display: block;
        width: 100%;
        text-align: center;
    }

    .ring1, .ring2, .ring3, .ring4 {
        position: absolute;
        border-radius: 50%;
        border: 1px dashed var(--divider-color, #e0e0e0);
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .ring1 { width: 250px; height: 250px; }
    .ring2 { width: 230px; height: 230px; }
    .ring3 { width: 210px; height: 210px; }
    .ring4 { width: 190px; height: 190px; }

    .clock_arc{
        position: absolute;
        border-radius: 50%;
        border: 5px solid transparent;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        /* Masking ensures only the ring area is colored, not the full circle */
        mask: radial-gradient(transparent calc(50% - 5px), black calc(50% - 4px), black calc(50% + 4px), transparent calc(50% + 5px));
        -webkit-mask: radial-gradient(transparent calc(50% - 5px), black calc(50% - 4px), black calc(50% + 4px), transparent calc(50% + 5px));
    }

    .clock_arc.ring1 { width: 350px; height: 350px; }
    .clock_arc.ring2 { width: 320px; height: 320px; }
    .clock_arc.ring3 { width: 290px; height: 290px; }
    .clock_arc.ring4 { width: 260px; height: 260px; }
    .clock_arc.outer_arc { width: 560px; height: 560px; }

    .hour_hand {
        position: absolute;
        width: 6px;
        height: 100px;
        background: var(--accent-color, #03a9f4);
        left: 50%;
        top: 50%;
        transform-origin: 50% 100%;
        transform: translateX(-50%) translateY(-100%);
        border-radius: 3px;
        transition: transform 0.1s linear; /* Smooth transition for clock hand */
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

    .sun_marker {
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

    .sun_marker span {
        display: block;
        transform: translateY(1px);
    }
    
    .sun_marker ha-icon {
        --mdc-icon-size: 18px;
        color: inherit; 
    }
    
    .marker {
        position: absolute;
        font-size: 16px;
        color: var(--primary-text-color, #333);
        left: 50%;
        top: 5px;
        transform-origin: 50% 185px;
        transform: translateX(-50%);
        font-weight: bold;
        pointer-events: none;
        background: var(--card-background-color, #fff);
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 0 5px rgba(0,0,0,0.3);
    }

    .marker ha-icon {
        --mdc-icon-size: 20px;
        color: inherit;
    }

    /* Legends Styling */
    .legends-container {
        display: flex;
        flex-wrap: wrap; /* Allows items to wrap to next line */
        justify-content: center;
        gap: 15px; /* Space between legend items */
        margin-top: 20px;
        width: 100%;
        padding-bottom: 10px;
        box-sizing: border-box; /* Include padding in element's total width */
    }

    .legend_item {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: var(--primary-text-color, #333);
        white-space: nowrap; /* Prevent text wrapping within an item */
    }

    .legend_color_box {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        margin-right: 8px;
        border: 1px solid var(--divider-color, #e0e0e0); /* Add a subtle border */
        flex-shrink: 0; /* Prevent the box from shrinking */
    }

    .legend_icon {
        margin-right: 8px;
        font-size: 18px; /* Base size for text icons */
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .legend_icon ha-icon {
        --mdc-icon-size: 18px; /* MDI icon specific size */
        color: inherit; 
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
        
        .hour_number {
            font-size: 11px;
            transform-origin: 50% 115px;
            top: 25px;
        }
        
        .hour_hand {
            height: 70px;
        }

        .hour_marker {
            transform-origin: 50% 135px;
            height: 8px;
        }

        .hour_marker.major {
            transform-origin: 50% 120px;
            height: 20px;
        }

        .ring1 { width: 180px; height: 180px; }
        .ring2 { width: 160px; height: 160px; }
        .ring3 { width: 140px; height: 140px; }
        .ring4 { width: 120px; height: 120px; }

        .clock_arc.ring1 { width: 250px; height: 250px; }
        .clock_arc.ring2 { width: 220px; height: 220px; }
        .clock_arc.ring3 { width: 190px; height: 190px; }
        .clock_arc.ring4 { width: 160px; height: 160px; }
        .clock_arc.outer_arc { width: 420px; height: 420px; }

        .sun_marker {
            transform-origin: 50% 135px;
            font-size: 14px;
            width: 18px;
            height: 18px;
        }
        
        .marker {
            transform-origin: 50% 135px;
            font-size: 14px;
            width: 20px;
            height: 20px;
        }
        .marker ha-icon {
            --mdc-icon-size: 16px;
        }

        .legend_item {
            font-size: 12px;
        }
        .legend_color_box {
            width: 15px;
            height: 15px;
        }
        .legend_icon {
            font-size: 14px;
        }
        .legend_icon ha-icon {
            --mdc-icon-size: 15px;
        }
    }
`;