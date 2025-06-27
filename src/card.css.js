import { css } from 'lit';

export default css`
    ha-card {
        padding: 0 16px;
    }

    .hidden {
      display: none !important;
    }
    
    svg {
        width: 100%;
        height: 100%;
        pointer-events: none;
        display: block;
        position: absolute;
        inset: 0;
        overflow: visible;
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
        width: 380px;
        height: 380px;
        border-radius: 50%;
        background: var(--card-background-color, #fff);
        //border: 2px solid var(--divider-color, #e0e0e0);
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
        top: 30px;
        transform-origin: 50% 160px;
        transform: translateX(-50%);
    }

    .hour_marker.major {
        width: 3px;
        height: 15px;
        background: var(--primary-text-color, #333);
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
        top: 45px;
        transform-origin: 50% 145px;
        transform: translateX(-50%);
        user-select: none;
    }

    .hour_number span {
        display: block;
        width: 100%;
        text-align: center;
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

    
    @media (max-width: 600px) {
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
        
        .hour_marker {
            transform-origin: 50% 135px;
            height: 8px;
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