import React, { forwardRef, HTMLAttributes } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { useTheme } from '@mui/material/styles';
import { ListItem, Stack, Badge, TextField, Checkbox, Button, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

export interface TreeItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'id' | 'onChange' | 'onSelect'> {
  id?: UniqueIdentifier;
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
  onChangeDone?(done: boolean): void;
  done?: boolean;
  onSelect?: (id: UniqueIdentifier) => void;
}

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      id,
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
      done,
      onChangeDone,
      onSelect,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    const stackStyles = (clone: boolean | undefined, ghost: boolean | undefined) => ({
      width: '100%',
      p: 1,
      border: '1px solid',
      backgroundColor: theme.palette.background.default,
      borderColor: theme.palette.divider,
      boxSizing: 'border-box',
      ...(clone && {
        opacity: 0.8,
        position: 'absolute',
        boxShadow: '0px 15px 15px 0 rgba(34, 33, 81, 0.1)',
      }),
      ...(ghost && {
        position: 'relative',
        padding: 0,
        height: '8px',
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        '&:before': {
          zIndex: 1000,
          position: 'absolute',
          left: '-8px',
          top: '-4px',
          display: 'block',
          content: '""',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          border: '1px solid',
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.background.default,
        },
        '> *': {
          opacity: 0,
          height: 0,
        },
      }),
    });

    return (
      <ListItem
        ref={wrapperRef}
        sx={{
          p: 0,
          paddingLeft: `${depth * indentationWidth}px`,
          boxSizing: 'border-box',
          marginBottom: '-1px',
          ...(indicator && {
            opacity: 1,
            position: 'relative',
            zIndex: 1,
            marginBottom: '-1px',
          }),
          ...(disableSelection && {
            userSelect: 'none',
            WebkitUserSelect: 'none', // Safari/Chrome用
          }),
          ...(disableInteraction && {
            pointerEvents: 'none',
          }),
          ...(id === 'trash' && {
            marginTop: '20px',
          }),
        }}
        {...props}
      >
        <Stack direction='row' ref={ref} style={style} sx={stackStyles(clone, ghost)}>
          {id !== 'trash' ? (
            <Button
              sx={{ color: theme.palette.text.secondary, cursor: 'grab', width: '50px', minWidth: '50px' }}
              onClick={() => id !== undefined && onSelect?.(id)}
              {...handleProps}
            >
              <DragHandleIcon />
            </Button>
          ) : (
            <Button sx={{ color: theme.palette.text.secondary, width: '50px', minWidth: '50px' }} onClick={() => id !== undefined && onSelect?.(id)}>
              <DeleteIcon />
            </Button>
          )}
          {onCollapse && (
            <Button sx={{ color: theme.palette.text.secondary, width: '50px', minWidth: '50px' }} onClick={() => {onCollapse?.();id !== undefined && onSelect?.(id);  }}>
              <KeyboardArrowDownIcon
                style={{ transition: 'transform 250ms ease', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
              />
            </Button>
          )}
          {id !== 'trash' ? (
            <>
              <Checkbox
                sx={{ width: '50px', minWidth: '50px' }}
                checked={done}
                onClick={() => id !== undefined && onSelect?.(id)}
                onChange={(e) => onChangeDone?.(e.target.checked)}
              />
              <TextField
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onClick={() => id !== undefined && onSelect?.(id)}
                multiline
                fullWidth
                InputProps={{
                  style: {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
              {!clone && onRemove && (
                <Button sx={{ color: theme.palette.text.secondary, width: '50px', minWidth: '50px' }} onClick={onRemove}>
                  <CloseIcon />
                </Button>
              )}
            </>
          ) : (
            <Typography sx={{ py: '10px' }}> ゴミ箱 </Typography>
          )}
          {clone && childCount && childCount > 1 ? <Badge badgeContent={childCount} color='primary' /> : null}
        </Stack>
      </ListItem>
    );
  }
);
