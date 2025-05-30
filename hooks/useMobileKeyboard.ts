import { useEffect, RefObject } from 'react';
import { Platform, TextInput } from 'react-native';

type KeyboardType = 'text' | 'email' | 'numeric' | 'decimal';

interface UseMobileKeyboardProps {
  inputRef: RefObject<TextInput>;
  type?: KeyboardType;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  autoFocus?: boolean;
}

export function useMobileKeyboard({
  inputRef,
  type = 'text',
  enterKeyHint = 'done',
  autoFocus = false
}: UseMobileKeyboardProps) {
  useEffect(() => {
    if (Platform.OS === 'web' && inputRef.current) {
      const input = inputRef.current as unknown as HTMLInputElement;
      
      // Set input mode based on type
      const inputMode = {
        text: 'text',
        email: 'email',
        numeric: 'numeric',
        decimal: 'decimal'
      }[type];

      // Apply HTML attributes for mobile web
      input.setAttribute('inputmode', inputMode);
      input.setAttribute('enterkeyhint', enterKeyHint);
      
      if (autoFocus) {
        // Small delay to ensure the input is mounted
        setTimeout(() => {
          input.focus();
        }, 100);
      }
    }
  }, [inputRef, type, enterKeyHint, autoFocus]);

  return {
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur()
  };
}