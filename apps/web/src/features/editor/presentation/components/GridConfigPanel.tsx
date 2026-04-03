import { getAspectRatioOptions, orientationOptions } from '@/shared/constants/grid'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { NumberStepper } from '@/shared/ui/number-stepper/NumberStepper'
import { Panel } from '@/shared/ui/panel/Panel'
import { SegmentedControl } from '@/shared/ui/segmented-control/SegmentedControl'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '../../application/editorStore'
import styles from './editor.module.css'

type GridConfigPanelProps = {
  elevated?: boolean
  showHeader?: boolean
}

export function GridConfigPanel({
  elevated = false,
  showHeader = true,
}: GridConfigPanelProps) {
  const { t } = useI18n()
  const {
    aspectRatio,
    columns,
    emptyCellColor,
    marginColor,
    marginWidth,
    orientation,
    rows,
    setAspectRatio,
    setColumns,
    setEmptyCellColor,
    setMarginColor,
    setMarginWidth,
    setOrientation,
    setRows,
  } = useEditorStore(
    useShallow((state) => ({
      orientation: state.orientation,
      aspectRatio: state.aspectRatio,
      rows: state.rows,
      columns: state.columns,
      marginWidth: state.marginWidth,
      marginColor: state.marginColor,
      emptyCellColor: state.emptyCellColor,
      setOrientation: state.setOrientation,
      setAspectRatio: state.setAspectRatio,
      setRows: state.setRows,
      setColumns: state.setColumns,
      setMarginWidth: state.setMarginWidth,
      setMarginColor: state.setMarginColor,
      setEmptyCellColor: state.setEmptyCellColor,
    }))
  )

  const aspectRatioOptions = getAspectRatioOptions(orientation)

  return (
    <Panel className={styles.configPanel} elevated={elevated}>
      {showHeader ? (
        <div className={styles.configSectionHeader}>
          <h2 className={styles.sectionTitle}>{t('editor.config.title')}</h2>
        </div>
      ) : null}

      <section className={styles.configSection}>
        <div className={styles.configSectionHeader}>
          <h3 className={styles.sectionTitle}>
            {t('editor.config.sections.layout')}
          </h3>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>
            {t('editor.config.fields.orientation')}
          </span>
          <SegmentedControl
            columns={2}
            label={t('editor.config.fields.orientation')}
            options={orientationOptions.map((option) => ({
              value: option.value,
              label: t(option.translationKey),
            }))}
            value={orientation}
            onChange={setOrientation}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>
            {t('editor.config.fields.aspectRatio')}
          </span>
          <SegmentedControl
            columns={Math.min(4, aspectRatioOptions.length)}
            label={t('editor.config.fields.aspectRatio')}
            options={aspectRatioOptions.map((option) => ({
              value: option.value,
              label: t(option.translationKey),
            }))}
            value={aspectRatio}
            onChange={setAspectRatio}
          />
        </div>
      </section>

      <section className={styles.configSection}>
        <div className={styles.configSectionHeader}>
          <h3 className={styles.sectionTitle}>
            {t('editor.config.sections.structure')}
          </h3>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('editor.config.fields.rows')}</span>
          <NumberStepper
            decreaseLabel={t('editor.config.stepper.decreaseRows')}
            increaseLabel={t('editor.config.stepper.increaseRows')}
            canDecrease={rows > 1}
            canIncrease={rows < 5}
            value={rows}
            onDecrease={() => setRows(rows - 1)}
            onIncrease={() => setRows(rows + 1)}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>
            {t('editor.config.fields.columns')}
          </span>
          <NumberStepper
            decreaseLabel={t('editor.config.stepper.decreaseColumns')}
            increaseLabel={t('editor.config.stepper.increaseColumns')}
            canDecrease={columns > 1}
            canIncrease={columns < 5}
            value={columns}
            onDecrease={() => setColumns(columns - 1)}
            onIncrease={() => setColumns(columns + 1)}
          />
        </div>
      </section>

      <section className={styles.configSection}>
        <div className={styles.configSectionHeader}>
          <h3 className={styles.sectionTitle}>
            {t('editor.config.sections.appearance')}
          </h3>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>
            {t('editor.config.fields.marginWidth')}
          </span>
          <NumberStepper
            decreaseLabel={t('editor.config.stepper.decreaseMargin')}
            increaseLabel={t('editor.config.stepper.increaseMargin')}
            canDecrease={marginWidth > 0}
            canIncrease={marginWidth < 24}
            value={marginWidth}
            onDecrease={() => setMarginWidth(marginWidth - 1)}
            onIncrease={() => setMarginWidth(marginWidth + 1)}
          />
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {t('editor.config.fields.marginColor')}
          </span>
          <input
            className={styles.colorInput}
            type="color"
            value={marginColor}
            onChange={(event) => setMarginColor(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {t('editor.config.fields.emptyCellColor')}
          </span>
          <input
            className={styles.colorInput}
            type="color"
            value={emptyCellColor}
            onChange={(event) => setEmptyCellColor(event.target.value)}
          />
        </label>
      </section>
    </Panel>
  )
}
