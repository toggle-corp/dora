import React from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';

import { AdminLevel, AdminSet } from '#typings';
import { validate } from '../utils';
import styles from './styles.css';

interface SetProps {
    data: AdminSet;
    adminLevelMap: {
        [key: string]: AdminLevel;
    };
    adminLevels: AdminLevel[];
}

function SetItem(props: SetProps) {
    const { data, adminLevelMap, adminLevels } = props;

    // TODO: memoize
    const errors = validate(
        adminLevels,
        data.settings,
    );

    return (
        <div
            className={styles.set}
        >
            <h5 className={styles.setTitle}>
                {data.title}
            </h5>
            <div className={styles.adminLevelsList}>
                {data.settings.map((setting) => (
                    <div
                        key={setting.key}
                        className={styles.setAdminLevel}
                    >
                        <span
                            className={_cs(
                                styles.marker,
                                errors[setting.adminLevel].length > 0 && styles.errored,
                            )}
                            title={errors[setting.adminLevel].map((item) => item.title).join('\n')}
                        />
                        <div className={styles.adminLevelTitle}>
                            {adminLevelMap[setting.adminLevel].name}
                            {` (${setting.geoJson.features.length})`}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

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

    // TODO: memoize
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
                    <SetItem
                        key={set.key}
                        data={set}
                        adminLevelMap={adminLevelMap}
                        adminLevels={adminLevels}
                    />
                ))}
            </div>
        </div>
    );
}

export default Sets;
