-- UTF-8 编码
-- MySQL
create table student (
    sno        char(8),
    sname      char(8)  not null default  '佚名',
    age        tinyint,
    sex        char(1),
    dno        char(8),
    supervisor char(8),
    primary key (sno),
    check (sex = 'M'  or  sex='F')
);

create table course (
    cno    char(8)  primary key,
    cname  char(8)  not null  unique,
    pcno   char(8),
    credit tinyint
);

create table teacher (
    tno     char(8)  primary key,
    tname   char(8)  not null  default  '佚名',
    dno     char(8),
    salary  int,
    title   char(8) check (title in('讲师', '副教授', '教授'))
);

create table department (
    dno    char(8)   primary key,
    dname  char(8)   not null  default  '佚名',
    dean   char(8)
);


create table sc (
    sno     char(8),
    constraint sc_student_fk foreign key(sno) references  student(sno),
    cno     char(8),
    Constraint sc_course_fk foreign key(cno) references course(cno),
    grade   tinyint,
    primary key (sno, cno),
    check((grade  is null)     or  grade between 0 and 100)
);

create table tc (
    tno     char(8),
    constraint tc_teacher_fk foreign key (tno) references  teacher(tno),
    cno     char(8),
    constraint tc_course_fk foreign key(cno) references course(cno)
);


insert into student(sno,sname,age,sex,dno,supervisor)
values
("s01", "张一",   18, "M", "d01", "t01"),
("s02", "张二",   18, "M", "d01", "t01"),
("s03", "刘一",   18, "F", "d01", "t01"),
("s04", "刘二",   19, "M", "d01", "t02"),
("s05", "张三",   18, "M", "d01", "t02"),
("s06", "张四",   17, "F", "d02", "t03"),
("s07", "刘三",   18, "F", "d02", "t03"),
("s08", "张五",   18, "M", "d02", "t04"),
("s09", "张六",   19, "M", "d02", "t04"),
("s10", "刘四",   17, "M", "d03", "t05"),
("s11", "刘五",   18, "F", "d03", "t05"),
("s12", "张七",   18, "M", "d04", "t06");

insert into course(cno,cname,pcno,credit)
values
("c01", "数据库原理", "c05", 2),
("c02", "操作系统", "c05", 3),
("c03", "计算机网络", "c05", 3),
("c04", "数据结构", "c04", 3),
("c05", "编译原理", "c04", 2),
("c06", "算法分析", "c04", 3),
("c07", "离散数学", "c04", 2);

insert into teacher(tno,tname,dno,salary,title)
values
("t01", "李一",   "d01", 10000, "副教授"),
("t02", "李二",   "d01", 8000, "讲师"),
("t03", "李三",   "d02", 12000, "教授"),
("t04", "李四",   "d02", 10000, "副教授"),
("t05", "李五",   "d03", 8000, "讲师"),
("t06", "李六",   "d04", 12000, "教授");

insert into department(dno,dname,dean)
values
("d01", "网络所", "t01"),
("d02", "语言所", "t03"),
("d03", "软件所", "t05"),
("d04", "结构所", "t06");

insert into sc(sno,cno,grade)
values
("s01", "c01", 85),
("s02", "c01", 88),
("s03", "c01", 92),
("s04", "c02", 87),
("s05", "c02", 79),
("s06", "c03", 90),
("s07", "c03", 82),
("s08", "c04", 83),
("s09", "c04", 88),
("s10", "c05", 75),
("s11", "c05", 86),
("s12", "c05", 81),
("s01", "c05", 67),
("s01", "c02", 56),
("s04", "c04", 82),
("s02", "c03", 65),
("s03", "c03", null),
("s06", "c05", null);

insert into tc(tno,cno)
values
("t01", "c01"),
("t02", "c02"),
("t03", "c03"),
("t04", "c04"),
("t05", "c05"),
("t01", "c06"),
("t04", "c07"),
("t06",  null);

--  为学生表 student 中的 dno 列添加外键参考 department 表中的 dno
alter table student add constraint student_dept_fk foreign key(dno) references  department(dno);

--  增加索引否则无法建立外键约束
alter table teacher add index teacher_dno_index(dno);

--  为学生表 student 中的 supervisor 列添加外键参考 teacher 表中的 tno
alter table student add constraint student_teacher_fk foreign key(supervisor) references  teacher(tno);

--  为课程表 course 中的 pcno 列添加外键参考 course 表中的 cno
alter table course add constraint course_course_fk foreign key(pcno) references  course(cno);

--  为教师表 teacher 中的 dno 列添加外键参考 department 表中的 dno
alter table teacher add constraint teacher_dept_fk foreign key(dno) references  department(dno);

--  为部门表 department 中的 dean 列添加外键参考 teacher 表中的 tno
alter table department add constraint dept_teacher_fk foreign key(dean) references  teacher(tno);