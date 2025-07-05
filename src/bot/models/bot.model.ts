import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

interface IBotCreationAttr {
    user_id: string | undefined;
    first_name: string | undefined;
    last_name: string | undefined;
    lang: string | undefined;
    name: string | undefined
    role: string | undefined
    phone_number: string | undefined
    last_state: string | undefined;
}

@Table({ tableName: "user" })
export class Bot extends Model<Bot, IBotCreationAttr> {
    @Column({
        type: DataType.STRING,
        primaryKey: true
    })
    declare user_id: string | undefined

    @Column({
        type: DataType.STRING,
    })
    declare first_name: string | undefined

    @Column({
        type: DataType.STRING,
    })
    declare last_name: string | undefined

    @Column({
        type: DataType.STRING,
    })
    declare lang: string | undefined

    @Column({
        type: DataType.STRING,
    })
    declare name: string | undefined

    @Column({
        type: DataType.STRING,
    })
    declare role: string | undefined

    @Column({
        type: DataType.STRING,
    })
    declare phone_number: string | undefined

    @Column({
        type: DataType.STRING,
    })
    declare last_state: string | undefined
}