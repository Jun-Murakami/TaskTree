import React, {useEffect} from 'react';
import type {DraggableSyntheticListeners} from '@dnd-kit/core';
import type {Transform} from '@dnd-kit/utilities';
import { ListItem, Box, Typography } from '@mui/material';

import {Handle} from './Actions.tsx';
import {Remove} from './Actions.tsx';

import styles from './Item.module.css';

export interface ItemsProps {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: Record<string, unknown>;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  value: React.ReactNode;
  onRemove?(): void;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: React.Ref<HTMLElement>;
    style: React.CSSProperties | undefined;
    transform: ItemsProps['transform'];
    transition: ItemsProps['transition'];
    value: ItemsProps['value'];
  }): React.ReactElement;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, ItemsProps>(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = 'grabbing';

        return () => {
          document.body.style.cursor = '';
        };
      }, [dragOverlay]);

      return renderItem ? (
        renderItem({
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          index,
          fadeIn: Boolean(fadeIn),
          listeners,
          ref,
          style,
          transform,
          transition,
          value,
        })
      ) : (
        <ListItem
          sx={{
            ...wrapperStyle,
            transition: [transition, wrapperStyle?.transition]
              .filter(Boolean)
              .join(', '),
            '--translate-x': transform
              ? `${Math.round(transform.x)}px`
              : undefined,
            '--translate-y': transform
              ? `${Math.round(transform.y)}px`
              : undefined,
            '--scale-x': transform?.scaleX
              ? `${transform.scaleX}`
              : undefined,
            '--scale-y': transform?.scaleY
              ? `${transform.scaleY}`
              : undefined,
            '--index': index,
            '--color': color,
            // ここにstyles.Wrapperのスタイルをsxプロパティとして追加
            display: 'flex',
            boxSizing: 'border-box',
            '&.fadeIn': {
              animation: 'fadeIn 500ms ease',
            },
            '&.dragOverlay': {
              '--scale': 1.05,
              '--box-shadow': '0px 15px 15px 0 rgba(34, 33, 81, 0.25)',
              '--box-shadow-picked-up': '-1px 0 15px 0 rgba(34, 33, 81, 0.01)',
            },
            ...(fadeIn && {
              animation: 'fadeIn 500ms ease',
            }),
            ...(sorting && {
              // sortingに関連するスタイルをここに追加
            }),
            ...(dragOverlay && {
              '--scale': 1.05,
              boxShadow: '0px 15px 15px 0 rgba(34, 33, 81, 0.25)',
              '&:hover': {
                boxShadow: '-1px 0 15px 0 rgba(34, 33, 81, 0.01)',
              },
            }),
          }}
          ref={ref}
        >
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              alignItems: 'center',
              padding: '18px 20px',
              backgroundColor: 'background.paper',
              boxShadow: 1,
              borderRadius: 1,
              '&.dragging:not(.dragOverlay)': {
                opacity: 0.5,
                zIndex: 0,
              },
              // 他の条件に基づくスタイルも同様に追加
              ...(dragging && { opacity: 0.5 }),
              ...(handle && { cursor: 'grab' }),
              ...(dragOverlay && { boxShadow: 3 }),
              ...(disabled && { backgroundColor: 'grey.300' }),
              ...(color && { color: color }), // colorがpropsから渡される場合
            }}
            data-cypress="draggable-item"
            {...(!handle ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            {value}
            <Typography
              sx={{
                display: 'flex',
                alignSelf: 'flex-start',
                marginTop: '-12px',
                marginLeft: 'auto',
                marginBottom: '-15px',
                marginRight: '-10px',
              }}
            >
              {onRemove ? (
                <Remove className={styles.Remove} onClick={onRemove} />
              ) : null}
              {handle ? <Handle {...handleProps} {...listeners} /> : null}
            </Typography>
          </Box>
        </ListItem>
      );
    }
  )
);
