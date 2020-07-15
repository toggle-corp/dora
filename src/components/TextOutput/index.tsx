import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import styles from './styles.css';

interface TextOutputProps {
    className?: string;
    label: string | number;
    value: React.ReactNode | null;
}

function TextOutput({
    className,
    label,
    value,
}: TextOutputProps) {
    return (
        <div className={_cs(styles.textOutput, className)}>
            <div className={styles.label}>
                { label }
            </div>
            { isDefined(value) ? (
                <div className={styles.value}>
                    { value }
                </div>
            ) : (
                <div className={styles.nullValue}>
                    N/A
                </div>
            )}
        </div>
    );
}
export default TextOutput;
