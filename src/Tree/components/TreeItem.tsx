import React, { forwardRef, HTMLAttributes } from 'react';
import { useTheme } from '@mui/material/styles';
import { ListItem, Stack, Badge, TextField } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import classNames from 'classnames';

import { Action, Handle, Remove } from './Actions.tsx';
import styles from './TreeItem.module.css';

export interface TreeItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'id' | 'onChange'> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: {
    [key: string]: unknown;
  };
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  onCollapse?(): void;
  onRemove?(): void;
  wrapperRef?(node: HTMLLIElement): void;
  onChange?(value: string): void;
}

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      onChange,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    return (
      <ListItem
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction
        )}
        ref={wrapperRef}
        sx={{ p: 0, paddingLeft: `${depth * indentationWidth}px` }}
        {...props}
      >
        <Stack
          direction='row'
          ref={ref}
          style={style}
          sx={{
            width: '100%',
            p: 1,
            border: '1px solid',
            backgroundColor: theme.palette.background.default,
            borderColor: theme.palette.divider,
            boxSizing: 'border-box',
          }}
        >
          <Handle {...handleProps} />
          {onCollapse && (
            <Action onClick={onCollapse}>
              <KeyboardArrowDownIcon
                style={{ transition: 'transform 250ms ease', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
              />
            </Action>
          )}
          <TextField
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            multiline
            fullWidth
            InputProps={{
              style: {
                paddingTop: '10px',
                paddingBottom: '10px',
              },
            }}
          />
          {!clone && onRemove && <Remove onClick={onRemove} />}
          {clone && childCount && childCount > 1 ? <Badge badgeContent={childCount} color='primary' /> : null}
        </Stack>
      </ListItem>
    );
  }
);
