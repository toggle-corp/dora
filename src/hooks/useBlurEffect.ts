import { useEffect } from 'react';

function useBlurEffect(
    shouldWatch: boolean,
    callback: (clickedInside: boolean, e: MouseEvent) => void,
    elementRef: React.RefObject<HTMLElement>,
    parentRef: React.RefObject<HTMLElement>,
) {
    useEffect(
        () => {
            if (!shouldWatch) {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                return () => {};
            }

            const handleDocumentClick = (e: MouseEvent) => {
                const { current: element } = elementRef;
                const { current: parent } = parentRef;

                const isElementOrContainedInElement = element
                    ? element === e.target || element.contains(e.target as HTMLElement)
                    : false;
                const isParentOrContainedInParent = parent
                    ? parent === e.target || parent.contains(e.target as HTMLElement)
                    : false;

                const clickedInside = isElementOrContainedInElement || isParentOrContainedInParent;

                callback(clickedInside, e);
            };

            document.addEventListener('click', handleDocumentClick);

            return () => {
                document.removeEventListener('click', handleDocumentClick);
            };
        },
        [shouldWatch, callback, elementRef, parentRef],
    );
}
export default useBlurEffect;
