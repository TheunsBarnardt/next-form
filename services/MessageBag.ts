// src/utils/MessageBag.ts

import concat from 'lodash/concat';
import head from 'lodash/head';
import each from 'lodash/each';

type MessageType = 'error' | 'message';
type RemoveType = 'any' | 'error' | 'message';
type ClearType = 'all' | 'errors' | 'messages';

interface MessageGroups {
  errors: string[];
  messages: string[];
}

class MessageBag {
  private baseErrors: string[];
  private prepends: MessageGroups;
  private appends: MessageGroups;

  constructor(baseErrors: string[] = []) {
    this.baseErrors = baseErrors;
    this.prepends = {
      errors: [],
      messages: [],
    };
    this.appends = {
      errors: [],
      messages: [],
    };
  }

  get errors(): string[] {
    return concat(
      this.prepends.errors,
      this.baseErrors,
      this.appends.errors
    );
  }

  get messages(): string[] {
    return concat(
      this.prepends.messages,
      this.appends.messages
    );
  }

  /**
   * The first error
   *
   * @type {string | undefined}
   */
  get error(): string | undefined {
    return head(this.errors);
  }

  /**
   * The first message
   *
   * @type {string | undefined}
   */
  get message(): string | undefined {
    return head(this.messages);
  }

  prepend(msg: string, type: MessageType = 'error'): void {
    this.prepends[type === 'error' ? 'errors' : 'messages'].unshift(msg);
  }

  append(msg: string, type: MessageType = 'error'): void {
    this.appends[type === 'error' ? 'errors' : 'messages'].push(msg);
  }

  remove(msg: string, type: RemoveType = 'any'): void {
    if (['any', 'error'].includes(type)) {
      each(this.prepends.errors, (error, index) => {
        if (error === msg) {
          this.rm('prepends', 'errors', index);
        }
      });
      each(this.appends.errors, (error, index) => {
        if (error === msg) {
          this.rm('appends', 'errors', index);
        }
      });
    }

    if (['any', 'message'].includes(type)) {
      each(this.prepends.messages, (message, index) => {
        if (message === msg) {
          this.rm('prepends', 'messages', index);
        }
      });
      each(this.appends.messages, (message, index) => {
        if (message === msg) {
          this.rm('appends', 'messages', index);
        }
      });
    }
  }

  private rm(group: 'prepends' | 'appends', type: 'errors' | 'messages', index: number): void {
    this[group][type].splice(index, 1);
  }

  clear(type: ClearType = 'all'): void {
    if (type === 'all') {
      this.prepends = {
        errors: [],
        messages: [],
      };
      this.appends = {
        errors: [],
        messages: [],
      };
    } else {
      this.prepends[type] = [];
      this.appends[type] = [];
    }
  }

  clearPrepended(type: ClearType = 'all'): void {
    if (type === 'all') {
      this.prepends = {
        errors: [],
        messages: [],
      };
    } else {
      this.prepends[type] = [];
    }
  }

  clearAppended(type: ClearType = 'all'): void {
    if (type === 'all') {
      this.appends = {
        errors: [],
        messages: [],
      };
    } else {
      this.appends[type] = [];
    }
  }
}

export default MessageBag;