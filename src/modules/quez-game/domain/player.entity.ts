import { BaseDBEntity } from 'src/core/BaseDBEntity';
import { User } from 'src/modules/user-accounts/user/domain/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Game } from './game.entity';
import { Answer } from './answer.entity';

//юзер который стал играком
@Entity()
export class Player extends BaseDBEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  gameId: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @OneToMany(() => Answer, (answer) => answer.player)
  answers: Answer[];

  @ManyToOne(() => User, (user) => user.players, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Game, (game) => game.players, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  static createPlayer(userId: string, gameId: string): Player {
    const player = new Player();

    player.userId = userId;
    player.gameId = gameId;

    return player;
  }
}
