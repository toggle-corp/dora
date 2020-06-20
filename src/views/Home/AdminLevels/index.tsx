import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { AdminLevel } from '../typings';
import styles from './styles.css';

interface AdminLevelProps {
    data: AdminLevel;
}

function AdminLevelItem(props: AdminLevelProps) {
    const { data } = props;
    return (
        <div
            className={styles.adminLevel}
        >
            <span className={styles.marker} />
            <div>
                {data.name}
            </div>
        </div>
    );
}

interface Props {
    className?: string;
    adminLevels: AdminLevel[];
}

function AdminLevels(props: Props) {
    const {
        className,
        adminLevels,
    } = props;

    return (
        <div className={_cs(styles.adminLevels, className)}>
            <div className={styles.header}>
                <h5>Admin Levels</h5>
            </div>
            <div className={styles.adminLevelsList}>
                {adminLevels.map((ad) => (
                    <AdminLevelItem
                        key={ad.key}
                        data={ad}
                    />
                ))}
            </div>
        </div>
    );
}

export default AdminLevels;
