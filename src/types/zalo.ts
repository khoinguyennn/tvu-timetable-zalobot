// Zalo Bot API Types based on the new documentation

export interface ZaloChat {
  id: string;
  chat_type: 'PRIVATE' | 'GROUP';
}

export interface ZaloUser {
  id: string;
  is_bot: boolean;
  display_name: string;
}

export interface ZaloMessage {
  message_id: string;
  date: number;
  chat: ZaloChat;
  from: ZaloUser;
  text?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'file' | 'video' | 'audio' | 'location' | 'sticker';
  payload: {
    url?: string;
    coordinates?: {
      lat: number;
      long: number;
    };
    sticker_id?: string;
    [key: string]: any;
  };
}

export interface ZaloEvent {
  event_name: 'message.text.received' | 'message.image.received' | 'message.file.received' | 'message.audio.received' | 'message.video.received' | 'message.sticker.received' | 'message.location.received';
  message: ZaloMessage;
}

export interface GetUpdatesResponse {
  ok: boolean;
  result?: ZaloEvent;
}

export interface SendMessageRequest {
  chat_id: string;
  text?: string;
  attachment?: {
    type: 'image' | 'file';
    payload: {
      url: string;
    };
  };
}

export interface SendMessageResponse {
  ok: boolean;
  result?: {
    message_id: string;
  };
}

export interface BotConfig {
  token: string;
  apiUrl?: string;
  pollingInterval?: number;
}

export interface MessageHandler {
  (event: ZaloEvent): Promise<void> | void;
}
