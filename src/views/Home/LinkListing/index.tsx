import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    compareString,
    caseInsensitiveSubmatch,
} from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import TextInput from '#components/TextInput';
import SegmentInput from '#components/SegmentInput';

import {
    AdminLevel,
    AdminSet,
    DeletedItemProps,
} from '#typings';

import {
    getProperty,
    Link,
} from '../utils';

import AddedItem from './AddedItem';
import LinkUnlinkModal from './LinkUnlinkModal';
import styles from './styles.css';

function DeletedItem(props: DeletedItemProps) {
    const {
        from,
        name,
        code,
    } = props;

    return (
        <div
            className={_cs(styles.deletedItem, styles.item)}
            key={from}
        >
            <h5 className={styles.title}>{name}</h5>
            <TextOutput
                label="Code"
                value={code}
            />
        </div>
    );
}

interface TabOption {
    key: string;
    title: string;
}

const tabOptions: TabOption[] = [
    {
        key: 'unlinked',
        title: 'Unlinked',
    },
    {
        key: 'linked',
        title: 'Linked',
    },
];

const keySelector = (d: TabOption) => d.key;
const titleSelector = (d: TabOption) => d.title;

interface LinkListingProps {
    currentAdminLevel: string;
    mapping: { [key: string]: Link[] } | undefined;
    firstSet: AdminSet;
    secondSet: AdminSet;
    className?: string;
    onAreasLink: (to: number, from: number, adminLevel: AdminLevel['key']) => void;
    onAreasUnlink: (to: number, from: number, adminLevel: AdminLevel['key']) => void;
}
function LinkListing(props: LinkListingProps) {
    const {
        className,
        currentAdminLevel,
        mapping,
        firstSet,
        secondSet,
        onAreasLink,
        onAreasUnlink,
    } = props;

    const [currentTab, setCurrentTab] = useState(tabOptions[0].key);
    const [selectedAddedArea, setSelectedAddedArea] = useState<number>();
    const [recentStatusChangeIndex, setRecentStatusChangeIndex] = useState<number>();
    const [selectedDeletedArea, setSelectedDeletedArea] = useState<number>();
    const [modalVisibility, setModalVisibility] = useState(false);
    const [addedSearchText, setAddedSearchText] = useState('');
    const [deletedSearchText, setDeletedSearchText] = useState('');
    const [linkedSearchText, setLinkedSearchText] = useState('');

    const handleSelectedAreaChange = useCallback((addedArea?: number) => {
        setSelectedAddedArea(addedArea);
        setModalVisibility(true);
    }, [setSelectedAddedArea, setModalVisibility]);

    const unitMapping = useMemo(() => (
        mapping?.[currentAdminLevel]
    ), [currentAdminLevel, mapping]);

    const firstSettings = useMemo(() => (
        firstSet.settings.find((item) => item.adminLevel === currentAdminLevel)
    ), [currentAdminLevel, firstSet]);

    const secondSettings = useMemo(() => (
        secondSet.settings.find((item) => item.adminLevel === currentAdminLevel)
    ), [secondSet, currentAdminLevel]);

    const linked = useMemo(() => {
        if (!unitMapping || !firstSettings || !secondSettings) {
            return [];
        }

        return unitMapping.filter((item) => isDefined(item.from) && isDefined(item.to))
            .map((item) => {
                const fromProperty = getProperty(
                    firstSettings.pointer,
                    firstSettings.geoJson.features[item.from],
                );
                const toProperty = getProperty(
                    secondSettings.pointer,
                    secondSettings.geoJson.features[item.to],
                );
                return {
                    from: item.from,
                    to: item.to,
                    toName: toProperty.name,
                    toCode: toProperty.code,
                    fromName: fromProperty.name,
                    fromCode: fromProperty.code,
                    fromFeature: firstSettings.geoJson.features[item.from],
                    toFeature: secondSettings.geoJson.features[item.to],
                };
            })
            .filter((item) => (
                caseInsensitiveSubmatch(item.toName, linkedSearchText)
                || caseInsensitiveSubmatch(item.fromName, linkedSearchText)
            ))
            .sort((a, b) => compareString(a.toName, b.toName));
    }, [unitMapping, linkedSearchText, firstSettings, secondSettings]);

    const deleted: DeletedItemProps[] = useMemo(() => {
        if (!unitMapping || !firstSettings || !secondSettings) {
            return [];
        }

        return unitMapping.filter((item) => isDefined(item.from) && isNotDefined(item.to))
            .map((item) => {
                const property = getProperty(
                    firstSettings.pointer,
                    firstSettings.geoJson.features[item.from],
                );
                return {
                    from: item.from,
                    name: property.name,
                    code: property.code,
                    feature: firstSettings.geoJson.features[item.from],
                };
            })
            .filter((item) => caseInsensitiveSubmatch(item.name, deletedSearchText))
            .sort((a, b) => compareString(a.name, b.name));
    }, [deletedSearchText, unitMapping, firstSettings, secondSettings]);

    const added = useMemo(() => {
        if (!unitMapping || !firstSettings || !secondSettings) {
            return [];
        }

        return unitMapping.filter((item) => isNotDefined(item.from) && isDefined(item.to))
            .map((item) => {
                const property = getProperty(
                    secondSettings.pointer,
                    secondSettings.geoJson.features[item.to],
                );
                return {
                    to: item.to,
                    name: property.name,
                    code: property.code,
                    feature: secondSettings.geoJson.features[item.to],
                };
            })
            .filter((item) => caseInsensitiveSubmatch(item.name, addedSearchText))
            .sort((a, b) => compareString(a.name, b.name));
    }, [unitMapping, addedSearchText, firstSettings, secondSettings]);

    const handleModalCloseClick = useCallback(() => {
        setModalVisibility(false);
        setSelectedAddedArea(undefined);
        setSelectedDeletedArea(undefined);
        setRecentStatusChangeIndex(undefined);
    }, [
        setModalVisibility,
        setSelectedDeletedArea,
        setSelectedAddedArea,
        setRecentStatusChangeIndex,
    ]);

    const handleAreasLink = useCallback((to: number, from: number) => {
        if (currentTab === 'unlinked') {
            setRecentStatusChangeIndex(
                added.findIndex((area) => area.to === to),
            );
        } else {
            setRecentStatusChangeIndex(
                linked.findIndex((area) => area.to === to),
            );
        }
        onAreasLink(to, from, currentAdminLevel);
    }, [currentAdminLevel, onAreasLink, currentTab, setRecentStatusChangeIndex, added, linked]);

    const handleAreasUnlink = useCallback((to: number, from: number) => {
        if (currentTab === 'unlinked') {
            setRecentStatusChangeIndex(
                added.findIndex((area) => area.to === to),
            );
        } else {
            setRecentStatusChangeIndex(
                linked.findIndex((area) => area.to === to),
            );
        }
        onAreasUnlink(to, from, currentAdminLevel);
    }, [currentAdminLevel, onAreasUnlink, currentTab, setRecentStatusChangeIndex, added, linked]);

    const handleNextButtonClick = useCallback(() => {
        setSelectedDeletedArea(undefined);
        if (currentTab === 'unlinked') {
            const index = (recentStatusChangeIndex && (recentStatusChangeIndex - 1))
                || added.findIndex((area) => area.to === selectedAddedArea);
            setSelectedAddedArea(added[index + 1] ? added[index + 1].to : added[0].to);
        } else {
            const index = (recentStatusChangeIndex && (recentStatusChangeIndex - 1))
                || linked.findIndex((area) => area.to === selectedAddedArea);
            setSelectedAddedArea(linked[index + 1] ? linked[index + 1].to : linked[0].to);
        }
        setRecentStatusChangeIndex(undefined);
    }, [
        added,
        setSelectedAddedArea,
        selectedAddedArea,
        linked,
        currentTab,
        recentStatusChangeIndex,
        setRecentStatusChangeIndex,
    ]);

    const handlePreviousButtonClick = useCallback(() => {
        setSelectedDeletedArea(undefined);
        if (currentTab === 'unlinked') {
            const index = (recentStatusChangeIndex && (recentStatusChangeIndex - 1))
                || added.findIndex((area) => area.to === selectedAddedArea);
            setSelectedAddedArea(
                added[index - 1] ? added[index - 1].to : added[added.length - 1].to,
            );
        } else {
            const index = (recentStatusChangeIndex && (recentStatusChangeIndex - 1))
                || linked.findIndex((area) => area.to === selectedAddedArea);
            setSelectedAddedArea(
                linked[index - 1] ? linked[index - 1].to : linked[linked.length - 1].to,
            );
        }
        setRecentStatusChangeIndex(undefined);
    }, [
        added,
        setSelectedAddedArea,
        selectedAddedArea,
        linked,
        currentTab,
        recentStatusChangeIndex,
        setRecentStatusChangeIndex,
    ]);

    const {
        to,
        toFeature,
        toName,
        toCode,
        from,
        fromFeature,
        fromName,
        fromCode,
    } = useMemo(() => {
        const addedAreaInLinkedList = linked.find((a) => a.to === selectedAddedArea);
        const addedAreaInAddedList = added.find((a) => a.to === selectedAddedArea);

        if (isDefined(addedAreaInLinkedList)) {
            return ({
                to: selectedAddedArea,
                toName: addedAreaInLinkedList?.toName,
                toFeature: addedAreaInLinkedList?.toFeature,
                toCode: addedAreaInLinkedList?.toCode,
                from: addedAreaInLinkedList?.from,
                fromName: addedAreaInLinkedList?.fromName,
                fromFeature: addedAreaInLinkedList?.fromFeature,
                fromCode: addedAreaInLinkedList?.fromCode,
            });
        }

        return ({
            to: selectedAddedArea,
            toName: addedAreaInAddedList?.name,
            toFeature: addedAreaInAddedList?.feature,
            toCode: addedAreaInAddedList?.code,
            from: undefined,
            fromFeature: undefined,
            fromName: undefined,
            fromCode: undefined,
        });
    }, [selectedAddedArea, added, linked]);

    if (!unitMapping || !firstSettings || !secondSettings) {
        return null;
    }

    return (
        <div className={_cs(styles.links, className)}>
            <SegmentInput
                className={styles.tabs}
                options={tabOptions}
                optionKeySelector={keySelector}
                optionLabelSelector={titleSelector}
                value={currentTab}
                onChange={setCurrentTab}
            />
            {currentTab === 'unlinked' && (
                <>
                    {(added.length === 0 && deleted.length === 0) ? (
                        <div className={styles.noMapping}>
                            Hurrah!! There are no unlinked geo areas in this admin level!!
                        </div>
                    ) : (
                        <div className={styles.unlinkedContent}>
                            <div className={styles.block}>
                                <div className={styles.header}>
                                    <h2>{firstSet.title}</h2>
                                    <TextInput
                                        className={styles.textInput}
                                        placeholder="Search"
                                        value={deletedSearchText}
                                        onChange={setDeletedSearchText}
                                    />
                                </div>
                                <div className={styles.blockContent}>
                                    {deleted.map((item) => (
                                        <DeletedItem
                                            key={item.from}
                                            code={item.code}
                                            from={item.from}
                                            name={item.name}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className={styles.block}>
                                <div className={styles.header}>
                                    <h2>{secondSet.title}</h2>
                                    <TextInput
                                        className={styles.textInput}
                                        placeholder="Search"
                                        value={addedSearchText}
                                        onChange={setAddedSearchText}
                                    />
                                </div>
                                <div className={styles.blockContent}>
                                    {added.map((item) => (
                                        <AddedItem
                                            className={styles.item}
                                            key={item.to}
                                            to={item.to}
                                            code={item.code}
                                            name={item.name}
                                            onSelectedAreaChange={handleSelectedAreaChange}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
            {currentTab === 'linked' && (
                <div className={styles.linkedContent}>
                    <div className={styles.block}>
                        <div className={styles.header}>
                            <h2>Linked</h2>
                            <TextInput
                                className={styles.textInput}
                                placeholder="Search"
                                value={linkedSearchText}
                                onChange={setLinkedSearchText}
                            />
                        </div>
                        <div className={styles.blockContent}>
                            {linked.map((item) => (
                                <AddedItem
                                    className={styles.item}
                                    key={item.to}
                                    to={item.to}
                                    code={item.toCode}
                                    name={item.toName}
                                    from={item.from}
                                    onSelectedAreaChange={handleSelectedAreaChange}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {(modalVisibility && isDefined(to)) && (
                <LinkUnlinkModal
                    to={to}
                    name={toName}
                    feature={toFeature}
                    code={toCode}
                    from={from}
                    fromName={fromName}
                    fromFeature={fromFeature}
                    fromCode={fromCode}
                    onModalClose={handleModalCloseClick}
                    onAreasLink={handleAreasLink}
                    onAreasUnlink={handleAreasUnlink}
                    selectedDeletedArea={selectedDeletedArea}
                    setSelectedDeletedArea={setSelectedDeletedArea}
                    deletedAreas={deleted}
                    firstSetTitle={firstSet.title}
                    secondSetTitle={secondSet.title}
                    firstSettings={firstSettings}
                    secondSettings={secondSettings}
                    onNextClick={handleNextButtonClick}
                    onPreviousClick={handlePreviousButtonClick}
                />
            )}
        </div>
    );
}

export default LinkListing;
