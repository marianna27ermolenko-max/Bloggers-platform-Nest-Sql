import { BaseDBEntity } from 'src/core/BaseDBEntity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Question } from './question.entity';
import { Player } from './player.entity';

export enum AnswerStatuses {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

@Unique(['playerId', 'questionId'])
@Entity()
export class Answer extends BaseDBEntity {
  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ type: 'uuid' })
  playerId: string;

  @Column({ type: 'enum', enum: AnswerStatuses })
  status: AnswerStatuses;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @ManyToOne(() => Player, (player) => player.answers, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'playerId' })
  player: Player;

  static createAnswer(
    questionId: string,
    playerId: string,
    status: AnswerStatuses,
  ): Answer {
    const answer = new Answer();

    answer.questionId = questionId;
    answer.playerId = playerId;
    answer.status = status;

    return answer;
  }
}
