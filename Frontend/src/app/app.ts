
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  StudentService,
  Student,
  Course,
  CourseService
} from './services/student';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {

  students: Student[] = [];
  courses: Course[] = [];

  searchText: string = '';
  selectedCourse: string = 'All';
  courseSearchText: string = '';

  showForm = false;
  showCourseForm = false;

  // NOTIFICATION MANAGEMENT

  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  private notificationTimer: ReturnType<typeof setTimeout> | null = null;

  showNotification(
    message: string,
    type: 'success' | 'error' = 'success'
  ): void {
    if (this.notificationTimer !== null) {
      clearTimeout(this.notificationTimer);
    }

    this.notificationMessage = message;
    this.notificationType = type;
    this.cdr.markForCheck();

    this.notificationTimer = setTimeout(() => {
      this.notificationMessage = '';
      this.notificationTimer = null;
      this.cdr.markForCheck();
    }, 4000);
  }

  closeNotification(): void {
    if (this.notificationTimer !== null) {
      clearTimeout(this.notificationTimer);
      this.notificationTimer = null;
    }

    this.notificationMessage = '';
    this.cdr.markForCheck();
  }

  newStudent: Student = {
    name: '',
    email: '',
    course: '',
    age: 0
  };

  editingStudentId: number | null = null;
  selectedStudent: Student | null = null;

  editedStudent: Student = {
    name: '',
    email: '',
    course: '',
    age: 0
  };

  newCourse: Course = {
    name: '',
    description: '',
    duration: 1
  };

  editingCourseId: number | null = null;

  editedCourse: Course = {
    name: '',
    description: '',
    duration: 1
  };

  constructor(
    private studentService: StudentService,
    private courseService: CourseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadCourses();
  }

  // =========================================
  // STUDENT MANAGEMENT
  // =========================================

  loadStudents(): void {
    this.studentService.getStudents().subscribe({
      next: (data) => {
        this.students = [...data];
        this.cdr.markForCheck();
        console.log('Students loaded:', this.students);
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.showNotification(
          'Unable to load students. Please check the backend.',
          'error'
        );
      }
    });
  }

  addStudent(): void {
    this.studentService.addStudent(this.newStudent).subscribe({
      next: () => {
        this.showNotification('Student added successfully!', 'success');
        this.newStudent = { name: '', email: '', course: '', age: 0 };
        this.showForm = false;
        this.loadStudents();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error adding student:', error);
        this.showNotification(
          'Unable to add student. Please try again.',
          'error'
        );
      }
    });
  }

  startEdit(student: Student): void {
    this.editingStudentId = student.id!;
    this.editedStudent = {
      name: student.name,
      email: student.email,
      course: student.course,
      age: student.age
    };
    this.cdr.markForCheck();
  }

  saveEdit(): void {
    if (this.editingStudentId === null) return;

    const studentToUpdate: Student = {
      id: this.editingStudentId,
      name: this.editedStudent.name,
      email: this.editedStudent.email,
      course: this.editedStudent.course,
      age: this.editedStudent.age
    };

    this.studentService.updateStudent(
      this.editingStudentId,
      studentToUpdate
    ).subscribe({
      next: () => {
        this.showNotification('Student updated successfully!', 'success');
        this.editingStudentId = null;
        this.loadStudents();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error updating student:', error);
        this.showNotification('Unable to update student.', 'error');
      }
    });
  }

  cancelEdit(): void {
    this.editingStudentId = null;
    this.cdr.markForCheck();
  }

  deleteStudent(id: number): void {
    const confirmDelete = confirm(
      'Are you sure you want to delete this student?'
    );

    if (!confirmDelete) return;

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.showNotification('Student deleted successfully!', 'success');
        this.loadStudents();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error deleting student:', error);
        this.showNotification('Unable to delete student.', 'error');
      }
    });
  }

  getTotalCourses(): number {
    return this.courses.length;
  }

  // STUDENTS DISPLAYED IN ALPHABETICAL ORDER

  get filteredStudents(): Student[] {
    const search = (this.searchText || '').toLowerCase().trim();

    return this.students
      .filter(student => {
        const matchesSearch =
          !search ||
          student.name.toLowerCase().includes(search) ||
          student.email.toLowerCase().includes(search) ||
          student.course.toLowerCase().includes(search);

        const matchesCourse =
          this.selectedCourse === 'All' ||
          student.course === this.selectedCourse;

        return matchesSearch && matchesCourse;
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
  }

  // ALL COURSE FILTER OPTIONS IN ALPHABETICAL ORDER

  getUniqueCourses(): string[] {
    return this.courses
      .map(course => course.name)
      .sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' })
      );
  }

  viewStudent(student: Student): void {
    this.selectedStudent = student;
    this.cdr.markForCheck();
  }

  closeStudentDetails(): void {
    this.selectedStudent = null;
    this.cdr.markForCheck();
  }

  // =========================================
  // COURSE MANAGEMENT
  // =========================================

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = [...data];
        this.cdr.markForCheck();
        console.log('Courses loaded:', this.courses);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.showNotification(
          'Unable to load courses. Please check that the backend is running.',
          'error'
        );
      }
    });
  }

  addCourse(): void {
    this.courseService.addCourse(this.newCourse).subscribe({
      next: () => {
        this.showNotification('Course added successfully!', 'success');
        this.newCourse = { name: '', description: '', duration: 1 };
        this.showCourseForm = false;
        this.loadCourses();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error adding course:', error);
        this.showNotification(
          'Unable to add course. Please try again.',
          'error'
        );
      }
    });
  }

  cancelCourseForm(): void {
    this.showCourseForm = false;
    this.newCourse = { name: '', description: '', duration: 1 };
    this.cdr.markForCheck();
  }

  startCourseEdit(course: Course): void {
    this.showCourseForm = false;
    this.editingCourseId = course.id!;
    this.editedCourse = {
      name: course.name,
      description: course.description,
      duration: course.duration
    };
    this.cdr.markForCheck();
  }

  saveCourseEdit(): void {
    if (this.editingCourseId === null) return;

    const courseToUpdate: Course = {
      id: this.editingCourseId,
      name: this.editedCourse.name,
      description: this.editedCourse.description,
      duration: this.editedCourse.duration
    };

    this.courseService.updateCourse(
      this.editingCourseId,
      courseToUpdate
    ).subscribe({
      next: () => {
        this.showNotification('Course updated successfully!', 'success');
        this.editingCourseId = null;
        this.loadCourses();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error updating course:', error);
        this.showNotification('Unable to update course.', 'error');
      }
    });
  }

  cancelCourseEdit(): void {
    this.editingCourseId = null;
    this.editedCourse = {
      name: '',
      description: '',
      duration: 1
    };
    this.cdr.markForCheck();
  }

  deleteCourse(id: number): void {
    const confirmDelete = confirm(
      'Are you sure you want to delete this course?'
    );

    if (!confirmDelete) return;

    this.courseService.deleteCourse(id).subscribe({
      next: () => {
        this.showNotification('Course deleted successfully!', 'success');
        this.loadCourses();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error deleting course:', error);
        this.showNotification('Unable to delete course.', 'error');
      }
    });
  }

  // COURSES DISPLAYED IN ALPHABETICAL ORDER

  get filteredCourses(): Course[] {
    const search = (this.courseSearchText || '').toLowerCase().trim();

    return this.courses
      .filter(course =>
        course.name.toLowerCase().includes(search) ||
        course.description.toLowerCase().includes(search)
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
  }

  // =========================================
  // STUDENT ENROLMENT CHART
  // =========================================

  get enrollmentChartData(): {
    courseName: string;
    count: number;
    percentage: number;
  }[] {
    const sortedCourses = [...this.courses].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    const counts = sortedCourses.map(course =>
      this.students.filter(
        student => student.course === course.name
      ).length
    );

    const maxCount = Math.max(...counts, 1);

    return sortedCourses.map((course, index) => ({
      courseName: course.name,
      count: counts[index],
      percentage: (counts[index] / maxCount) * 100
    }));
  }

  get totalEnrolments(): number {
    return this.students.length;
  }
}
