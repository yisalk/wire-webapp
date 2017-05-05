/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

'use strict';

window.z = window.z || {};
window.z.components = z.components || {};

z.components.ConversationListCell = class ConversationListCell {
  constructor({conversation, is_selected = z.util.noop, click = z.util.noop}) {
    this.on_in_viewport = this.on_in_viewport.bind(this);

    this.conversation = conversation;
    this.is_selected = is_selected;
    this.on_click = click;

    this.entered_viewport = ko.observable(false);
    this.users = ko.pureComputed(() => this.conversation.participating_user_ets());

    this.cell_state = ko.pureComputed(() => {
      return this.entered_viewport() ? z.conversation.ConversationCellState.generate(this.conversation) : '';
    }).extend({rateLimit: 100});
  }

  on_in_viewport() {
    this.entered_viewport(true);
    return true;
  }
};

ko.components.register('conversation-list-cell', {
  template: `
    <div class="conversation-list-cell" data-bind="attr: {'data-uie-uid': conversation.id, 'data-uie-value': conversation.display_name}, css: {'conversation-list-cell-active': is_selected(conversation)}, in_viewport: on_in_viewport">
      <div class="conversation-list-cell-left" data-bind="css: {'conversation-list-cell-left-opaque': conversation.removed_from_conversation() || conversation.participating_user_ids().length === 0}">
        <!-- ko if: conversation.is_group() -->
          <group-avatar class="conversation-list-cell-avatar-arrow" data-bind="click: function(data, event) {on_click(conversation, event)}" data-uie-name="go-options" params="users: users(), conversation: conversation"></group-avatar>
        <!-- /ko -->
        <!-- ko ifnot: conversation.is_group() -->
          <user-avatar class="user-avatar-s" data-uie-name="go-options" params="user: users()[0]"></user-avatar>
        <!-- /ko -->
      </div>
      <div class="conversation-list-cell-center">
        <span class="conversation-list-cell-name" data-bind="text: conversation.display_name()"></span>
        <span class="conversation-list-cell-description" data-bind="text: cell_state().description" data-uie-name="secondary-line"></span>
      </div>
      <div class="conversation-list-cell-right">
        <span class="conversation-list-cell-context-menu" data-bind="click: function(data, event) {on_click(conversation, event)}"></span>
        <!-- ko if: cell_state().icon === z.conversation.ConversationStatusIcon.PENDING_CONNECTION -->
          <span class="conversation-list-cell-badge cell-badge-dark icon-pending" data-uie-name="status-pending"></span>
        <!-- /ko -->
        <!-- ko if: cell_state().icon === z.conversation.ConversationStatusIcon.UNREAD_PING -->
          <span class="conversation-list-cell-badge cell-badge-dark icon-ping" data-uie-name="status-ping"></span>
        <!-- /ko -->
        <!-- ko if: cell_state().icon === z.conversation.ConversationStatusIcon.MISSED_CALL -->
          <span class="conversation-list-cell-badge cell-badge-dark icon-call" data-uie-name="status-missed-call"></span>
        <!-- /ko -->
        <!-- ko if: cell_state().icon === z.conversation.ConversationStatusIcon.MUTED -->
          <span class="conversation-list-cell-badge cell-badge-dark icon-silence" data-uie-name="status-silence"></span>
        <!-- /ko -->
        <!-- ko if: cell_state().icon === z.conversation.ConversationStatusIcon.UNREAD_MESSAGES && conversation.unread_event_count() > 0 -->
          <span class="conversation-list-cell-badge cell-badge-light" data-uie-name="status-unread" data-bind="text: conversation.unread_event_count()"></span>
        <!-- /ko -->
      </div>
    </div>
  `,
  viewModel: z.components.ConversationListCell,
});
