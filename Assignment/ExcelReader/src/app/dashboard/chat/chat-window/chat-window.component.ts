import {  NgIf } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChatMessageModel, User } from '../../../app.models';
import { ChatService } from '../../../services/chat.service';
import { MatIconModule } from '@angular/material/icon';
import { VoiceCallService } from '../../../services/voice-call.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    NgIf,
    MatIconModule,
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css',
})
export class ChatWindowComponent implements OnInit, AfterViewChecked {
  @Input({ required: true }) fromUser!: User;
  @Input({ required: true }) chatActivityState = 'active';
  @Output() EmitOutgoingMessage = new EventEmitter<string>();
  @Output() EmitCloseChatWindow = new EventEmitter<boolean>();
  @Output() chatWindowLoaded = new EventEmitter<boolean>();

  @ViewChild('chatWindow') chatWindow!: ElementRef;

  selectedUser = this.chatService.currentUser;
  selectedUsername = this.selectedUser()?.name;
  messages = computed(() => {
    const index = this.chatService
      .chats()
      .findIndex((ch) => ch.recpId == this.selectedUser()?.id);
    let chats: ChatMessageModel[] = [];
    if (index != -1) {
      chats = this.chatService.chats()[index].chatList;
    }
    return chats;
  });
  newMessage = '';

  constructor(
    private chatService: ChatService,
    private voiceCallService: VoiceCallService,
    private callDialog: MatDialog
  ) {
    effect(() => {
      this.selectedUsername = this.selectedUser()?.name;
    });
  }

  ngOnInit(): void {
    //emit event so that user info can be loaded
    this.chatWindowLoaded.emit(true);
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  sendOutgoingMessageEvent() {
    if (this.newMessage.trim()) {
      this.EmitOutgoingMessage.emit(this.newMessage.trim());
    }
    //clear input
    this.newMessage = '';
  }

  closeChat() {
    this.chatService.setCurrentUser(null);
    this.EmitCloseChatWindow.emit();
  }

  callUser() {
    //check permission
    this.chatService.callUser();
  }
  endCall() {
    //check permission
    this.chatService.endCall();
  }
  scrollToBottom(): void {
    try {
      this.chatWindow.nativeElement.scrollTop =
        this.chatWindow.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
