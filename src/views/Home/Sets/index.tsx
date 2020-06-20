import React from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';

import { AdminLevel, AdminSet } from '../typings';
import styles from './styles.css';

interface Props {
    className?: string;
    sets: AdminSet[];
    adminLevels: AdminLevel[];
}

function Sets(props: Props) {
    const {
        className,
        sets,
        adminLevels,
    } = props;

    const adminLevelMap = listToMap(adminLevels, (d) => d.adminLevel, (d) => d);

    return (
        <div className={_cs(styles.sets, className)}>
            <div className={styles.header}>
                <h4>Sets</h4>
            </div>
            <div className={styles.setsList}>
                {sets.map((set) => (
                    <div
                        className={styles.set}
                        key={set.key}
                    >
                        <h5 className={styles.setTitle}>
                            {set.title}
                        </h5>
                        <div className={styles.adminLevelsList}>
                            {set.adminLevels.map((level) => (
                                <div
                                    key={level.key}
                                    className={styles.setAdminLevel}
                                >
                                    <span className={styles.marker} />
                                    <div className={styles.adminLevelTitle}>
                                        {adminLevelMap[level.adminLevel].title}
                                        {` (${level.geojson?.features?.length})`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Sets;
