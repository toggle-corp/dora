import React from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';

import { AdminLevel, AdminSet } from '../typings';
// import { validate } from '../utils';
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

    const adminLevelMap = listToMap(
        adminLevels,
        (d) => d.key,
        (d) => d,
    );

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
                            {set.settings.map((setting) => (
                                <div
                                    key={setting.key}
                                    className={styles.setAdminLevel}
                                >
                                    <span className={styles.marker} />
                                    <div className={styles.adminLevelTitle}>
                                        {adminLevelMap[setting.adminLevel].name}
                                        {` (${setting.geoJson.features.length})`}
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
