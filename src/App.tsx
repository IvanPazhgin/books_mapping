import "./styles.css";
import { Book, BookInformation } from "./lib/types";
import { User } from "./lib/types";
import { Review, ReviewInformation } from "./lib/types";
import { getBooks, getUsers, getReviews } from "./lib/api";
import { useEffect, useState, FC } from "react";
import Card from "./Card";

// Техническое задание:
// Доработать приложение App, чтобы в отрисованном списке
// были реальные отзывы, автор книги и автор отзыва.
// Данные об отзывах и пользователях можно получить при помощи асинхронных
// функций getUsers, getReviews

// функция getBooks возвращает Promise<Book[]>
// функция getUsers возвращает Promise<User[]>
// функция getReviews возвращает Promise<Review[]>

// В объектах реализующих интерфейс Book указаны только uuid
// пользователей и обзоров

// В объектах реализующих интерфейс BookInformation, ReviewInformation
// указана полная информация об пользователе и обзоре.

const toBookInformation = (
  book: Book,
  users: User[],
  reviews: Review[]
): BookInformation => {
  // Поиск автора книги по его id
  const author = users.find((user) => user.id === book.authorId) || {
    id: book.authorId,
    name: "Автор не найден",
  };

  // Отзывы для книги
  const bookReviews: ReviewInformation[] = book.reviewIds.map((reviewId) => {
    const review = reviews.find((rev) => rev.id === reviewId);
    if (review) {
      // Пользователь, написавший отзыв
      const user = users.find((user) => user.id === review.userId) || {
        id: review.userId,
        name: "Пользователь не найден",
      };
      return { id: review.id, text: review.text, user };
    } else {
      return {
        id: reviewId,
        text: "Отзыв не найден",
        user: { id: "", name: "Неизвестный пользователь" },
      };
    }
  });

  return {
    id: book.id,
    name: book.name || "Книга без названия",
    author,
    reviews: bookReviews,
    description: book.description,
  };
};

const App: FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedBooks, fetchedUsers, fetchedReviews] = await Promise.all([
        getBooks(),
        getUsers(),
        getReviews(),
      ]);

      setBooks(fetchedBooks);
      setUsers(fetchedUsers);
      setReviews(fetchedReviews);

      console.log("users:", fetchedUsers);
      console.log("reviews:", fetchedReviews);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>Мои книги:</h1>
      {isLoading && <div>Загрузка...</div>}
      {!isLoading &&
        books.map((b) => (
          <Card key={b.id} book={toBookInformation(b, users, reviews)} />
        ))}
    </div>
  );
};

export default App;
