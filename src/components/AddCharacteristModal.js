// components/GenericModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, Button } from '@mui/material';

const AddCharacteristicModal = ({
  open,
  onClose,
  title,
  titleProps = {},
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  confirmDisabled = false,
  sxBox = {},
  sxCancelBtn = {},
  sxConfirmBtn = {},
}) => (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-12.5%, -50%)',
        width: 400,
        bgcolor: 'white',
        backdropFilter: 'blur(4px)',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        ...sxBox,
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{ mb: 2, fontFamily: 'var(--font-source)', ...titleProps.sx }}
        {...titleProps}
      >
        {title}
      </Typography>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{ fontFamily: 'var(--font-source)', ...sxCancelBtn }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={confirmDisabled}
          sx={{
            fontFamily: 'var(--font-source)',
            ...sxConfirmBtn,
          }}
        >
          {confirmText}
        </Button>
      </Box>
    </Box>
  </Modal>
);

AddCharacteristicModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  titleProps: PropTypes.object,
  children: PropTypes.node.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmDisabled: PropTypes.bool,
  sxBox: PropTypes.object,
  sxCancelBtn: PropTypes.object,
  sxConfirmBtn: PropTypes.object,
};

export default AddCharacteristicModal;