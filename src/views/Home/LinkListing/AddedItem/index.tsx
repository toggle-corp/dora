import React, { useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import Button from '#components/Button';

import { Link } from '../../utils';

import styles from './styles.css';

interface AddedItemProps {
    to: Link['to'];
    from?: Link['from'];
    name?: string;
    code?: string | number;
    onSelectedAreaChange: (to?: number) => void;
    className?: string;
}

function AddedItem(props: AddedItemProps) {
    const {
        to,
        from,
        name,
        code,
        className,
        onSelectedAreaChange,
    } = props;

    const handleLinkButtonClick = useCallback(() => {
        onSelectedAreaChange(to);
    }, [to, onSelectedAreaChange]);

    return (
        <div className={_cs(styles.addedItem, className)}>
            <header className={styles.header}>
                <h5 className={styles.title}>{name}</h5>
                <Button
                    className={styles.button}
                    transparent
                    onClick={handleLinkButtonClick}
                >
                    {isDefined(from) ? 'View' : 'Link'}
                </Button>
            </header>
            <TextOutput
                label="Code"
                value={code}
            />
        </div>
    );
}

export default AddedItem;
