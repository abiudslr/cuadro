import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getAspectRatioOptions, orientationOptions } from '@/shared/constants/grid'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/button/Button'
import {
  CheckIcon,
  ChevronUpIcon,
  DownloadIcon,
  GridIcon,
  HorizontalIcon,
  SlidersIcon,
  VerticalIcon,
} from '@/shared/ui/icons/Icons'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../../application/editorStore'
import styles from './editor.module.css'

type EditorQuickBarProps = {
  floating?: boolean
  onOpenExport: () => void
}

export function EditorQuickBar({
  floating = false,
  onOpenExport,
}: EditorQuickBarProps) {
  const { t } = useI18n()
  const [openMenu, setOpenMenu] = useState<'orientation' | 'ratio' | 'grid' | null>(null)
  const [menuStyle, setMenuStyle] = useState<{
    left: number
    bottom: number
    minWidth: number
  } | null>(null)
  const quickBarRef = useRef<HTMLDivElement | null>(null)
  const menuPortalRef = useRef<HTMLDivElement | null>(null)
  const orientationButtonRef = useRef<HTMLButtonElement | null>(null)
  const ratioButtonRef = useRef<HTMLButtonElement | null>(null)
  const gridButtonRef = useRef<HTMLButtonElement | null>(null)
  const {
    aspectRatio,
    columns,
    openConfigSheet,
    orientation,
    rows,
    setAspectRatio,
    setColumns,
    setOrientation,
    setRows,
  } =
    useEditorStore(
      useShallow((state) => ({
        orientation: state.orientation,
        aspectRatio: state.aspectRatio,
        rows: state.rows,
        columns: state.columns,
        openConfigSheet: state.openConfigSheet,
        setOrientation: state.setOrientation,
        setAspectRatio: state.setAspectRatio,
        setRows: state.setRows,
        setColumns: state.setColumns,
      }))
    )

  const OrientationIcon =
    orientation === 'vertical' ? VerticalIcon : HorizontalIcon
  const aspectRatioOptions = getAspectRatioOptions(orientation)
  const gridPresets = [
    { rows: 2, columns: 2 },
    { rows: 2, columns: 3 },
    { rows: 3, columns: 3 },
    { rows: 3, columns: 4 },
    { rows: 4, columns: 4 },
    { rows: 4, columns: 5 },
  ]

  useEffect(() => {
    if (!openMenu) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node

      if (
        !quickBarRef.current?.contains(target) &&
        !menuPortalRef.current?.contains(target)
      ) {
        setOpenMenu(null)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [openMenu])

  const menuItems =
    openMenu === 'orientation'
      ? orientationOptions.map((option) => ({
          key: option.value,
          label: t(option.translationKey),
          isActive: option.value === orientation,
          onSelect: () => {
            setOrientation(option.value)
            setOpenMenu(null)
          },
        }))
      : openMenu === 'ratio'
        ? aspectRatioOptions.map((option) => ({
            key: option.value,
            label: option.value,
            isActive: option.value === aspectRatio,
            onSelect: () => {
              setAspectRatio(option.value)
              setOpenMenu(null)
            },
          }))
        : openMenu === 'grid'
          ? gridPresets.map((preset) => {
              const label = `${preset.rows}x${preset.columns}`

              return {
                key: label,
                label,
                isActive: preset.rows === rows && preset.columns === columns,
                onSelect: () => {
                  setRows(preset.rows)
                  setColumns(preset.columns)
                  setOpenMenu(null)
                },
              }
            })
          : []

  useEffect(() => {
    if (!openMenu) {
      return
    }

    const button =
      openMenu === 'orientation'
        ? orientationButtonRef.current
        : openMenu === 'ratio'
          ? ratioButtonRef.current
          : gridButtonRef.current

    if (!button) {
      return
    }

    const updateMenuStyle = () => {
      const rect = button.getBoundingClientRect()

      setMenuStyle({
        left: rect.left,
        bottom: window.innerHeight - rect.top + 10,
        minWidth: Math.max(rect.width, 132),
      })
    }

    updateMenuStyle()
    window.addEventListener('resize', updateMenuStyle)
    window.addEventListener('scroll', updateMenuStyle, true)

    return () => {
      window.removeEventListener('resize', updateMenuStyle)
      window.removeEventListener('scroll', updateMenuStyle, true)
    }
  }, [openMenu])

  return (
    <>
      <div ref={quickBarRef} className={floating ? styles.mobileDock : styles.quickBar}>
        <Button className={styles.quickExportButton} variant="primary" onClick={onOpenExport}>
          <span className={styles.quickExportIcon}>
            <DownloadIcon />
          </span>
          {t('editor.export.action')}
        </Button>

        <div className={styles.quickMetrics}>
          <div className={styles.metricMenu}>
            <button
              ref={orientationButtonRef}
              aria-expanded={openMenu === 'orientation'}
              aria-label={`${t('editor.mobileDock.orientation')}: ${t(
                `editor.config.orientation.${orientation}`
              )}`}
              className={styles.metricChipButton}
              type="button"
              onClick={() =>
                setOpenMenu((current) =>
                  current === 'orientation' ? null : 'orientation'
                )
              }
            >
              <span className={styles.metricIcon}>
                <OrientationIcon />
              </span>
              <span className={styles.metricValue}>
                {t(`editor.config.orientation.${orientation}`)}
              </span>
              <span className={styles.metricChevron}>
                <ChevronUpIcon />
              </span>
            </button>
          </div>

          <div className={styles.metricMenu}>
            <button
              ref={ratioButtonRef}
              aria-expanded={openMenu === 'ratio'}
              aria-label={`${t('editor.mobileDock.aspectRatio')}: ${aspectRatio}`}
              className={styles.metricChipButton}
              type="button"
              onClick={() =>
                setOpenMenu((current) => (current === 'ratio' ? null : 'ratio'))
              }
            >
              <span className={styles.metricValue}>{aspectRatio}</span>
              <span className={styles.metricChevron}>
                <ChevronUpIcon />
              </span>
            </button>
          </div>

          <div className={styles.metricMenu}>
            <button
              ref={gridButtonRef}
              aria-expanded={openMenu === 'grid'}
              aria-label={`${t('editor.mobileDock.cells')}: ${rows} x ${columns}`}
              className={styles.metricChipButton}
              type="button"
              onClick={() =>
                setOpenMenu((current) => (current === 'grid' ? null : 'grid'))
              }
            >
              <span className={styles.metricIcon}>
                <GridIcon />
              </span>
              <span className={styles.metricValue}>
                {rows}x{columns}
              </span>
              <span className={styles.metricChevron}>
                <ChevronUpIcon />
              </span>
            </button>
          </div>
        </div>

        <IconButton
          aria-label={t('common.openSettings')}
          className={styles.quickSettingsButton}
          compact={floating}
          onClick={openConfigSheet}
        >
          <SlidersIcon />
        </IconButton>
      </div>

      {openMenu && menuStyle
        ? createPortal(
            <div
              ref={menuPortalRef}
              className={styles.metricMenuPortal}
              style={{
                left: `${menuStyle.left}px`,
                bottom: `${menuStyle.bottom}px`,
                minWidth: `${menuStyle.minWidth}px`,
              }}
            >
              <div className={styles.metricMenuList} role="menu">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    className={styles.metricMenuItem}
                    type="button"
                    onClick={item.onSelect}
                  >
                    <span>{item.label}</span>
                    {item.isActive ? (
                      <span className={styles.metricMenuCheck}>
                        <CheckIcon />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
