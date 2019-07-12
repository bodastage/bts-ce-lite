import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
	
	@PrimaryGeneratedColumn()
    id: number;
	
	@Column()
	firstName: string;
	
	@Column()
    name: string;
	@Column()
	email: string;
	
	@Column()
	password: string;
}