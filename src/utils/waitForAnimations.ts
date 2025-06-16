import { Page } from "playwright";

export async function waitForAnimations(page: Page): Promise<void> {
    await page.evaluate(async () => {
        // Wait for next animation frame
        await new Promise(requestAnimationFrame);

        // Wait for all running animations and transitions to finish
        const animations = document.getAnimations();
        if (animations.length) {
            await Promise.allSettled(animations.map(animation => animation.finished));
        }

        // Extra: Wait for all .animatr elements to have .animatr__completed
        function allAnimatrCompleted() {
            return Array.from(document.querySelectorAll('.animatr')).every(el =>
                el.classList.contains('animatr__completed')
            );
        }
        const maxWait = 3000;
        const pollInterval = 50;
        let waited = 0;
        while (!allAnimatrCompleted() && waited < maxWait) {
            await new Promise(res => setTimeout(res, pollInterval));
            waited += pollInterval;
        }
    });
}