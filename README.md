
# Music Server backend API
MServer
=
MServer (придумайте оригинальное название, пожалуйста (: ) - сервер, который предоставляет услуги редактирования/создания альбомов, загрузки музыки и дальнейшего прослушивания.

API
-
MServer является backend приложением, то есть, приложением, которое не имеет пользовательской части. Вы можете принять участие в её разработке, для этого необходимо рассмотреть API интерфейс MServer'а.

**Общение между MServer и вашим будущим приложением должно происходить по протоколу HTTP(S).**
**Content-Type должен быть: `application/json`.**

MServer разделяет доступ, а это значит, что для работы с музыкой необходимо произвести авторизацию или регистрацию с последующей авторизацией.

Регистрация пользователя
-
Для регистрации пользователя необходимо отправить запрос:

    POST		/api/register

И передать в теле запроса JSON:

    {
	    "username": "Логин пользователя",
	    "password": "Пароль пользователя",
	    "name": "Имя пользователя",
	    "lastname": "Фамилия пользователя"
    }
    
В ответ вы получите один из следующих HTTP кодов:

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 409 | Conflict |Пользователь с таким `username` уже зарегистрирован в системе. Необходимо указать другой `username`. |
| 201 | Created |Пользователь успешно создан. |
| 400 | Bad request | Один или несколько параметров не задано.
| 403 | Forbidden |Регистрация временно приостановлена администратором. |


Данный запрос возвращает пустое тело.

Авторизация пользователя
-
Если Ваш пользователь зарегистрирован в системе - имеет смысл пройти авторизацию. Авторизация происходит с помощью передачи логина и пароля. В случае успешной авторизации вы получите JWT токен, который необходимо **передавать в заголовке к каждому запросу**. 

Для авторизации необходимо послать запрос:

    POST		/api/authenticate
И передать в теле запроса следующий JSON:

    {
	    "username": "Имя пользователя",
	    "password": "Пароль пользователя"
    }

| Параметр | Описание |
| -- | -- |
| username | Логин |
| password | Пароль |

Коды ответа:

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | Авторизация не удалась, неверный логин/пароль. |
| 200 | OK | Авторизация прошла успешно. |
| 400 | Bad request | Один или несколько параметров не задано. |

В случае успешной авторизации необходимо получить токен из тела ответа.
Тело успешного ответа выглядит следующим образом:

    {
	    "token": "<USER_TOKEN>"
    }

Данный токен необходимо передавать в каждый последующий запрос в HTTP заголовке:

    Authorization: Bearer <USER_TOKEN> 

Обратите внимание, что слово `Bearer` перед началом токена является **обязательным**!

В случае, если вы забудете передать токен в HTTP заголовке, или передадите невалидный токен, то получите ошибку `401 (Unauthorized)`.

Время жизни JWT токена: 1 час.
После истечения данного времени вам потребуется отправить запрос на авторизацию снова (в фоне) и продолжить работу с новым JWT токеном. Позже мы обсудим это более детально.

Альбомы
=
Пользователь имеет право создавать альбомы, редактировать, удалять и просматривать альбомы других пользователей (если они не приватные).
С точки зрения API альбом выглядит следующим образом:

    {
	   "id": "b652f29d-06f1-455e-b3f5-7cfc2e9afaa4",
	   "name": "Мой альбом",
	   "description": "Альбом с музыкой моего детства",
	   "createDate": "2019-10-17T15:00:33.236+0000",
	   "internal": true
	}

| Имя параметра | Тип данных |  Описание |
| -- | -- | -- |
| `id` | `string` | Уникальный идентификатор альбома |
| `name` | `string` | Имя альбома |
| `description` | `string` | Описание альбома |
| `createDate` | `Date` | Дата создания альбома |
| `internal` | `boolean` | Приватный альбом? |

Создание альбома
-
Для создания нового альбома нужно отправить запрос:

    POST		/api/album

Со следующим JSON содержимым:

    {
	    "name": "<ИМЯ СОЗДАВАЕМОГО АЛЬБОМА>",
	    "description": "<ОПИСАНИЕ СОЗДАВАЕМОГО АЛЬБОМА>",
	    "internal": "<ПРИВАТНЫЙ АЛЬБОМ?>"
    }

В случае успешного создания альбома - вы получите JSON ответ, содержащий полное описание альбома.

Коды ответа:

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Альбом создан успешно. |
| 400 | Bad request | Один или несколько параметров не задано. |


Получение информации об альбоме
-

    GET		/api/album/{id}

`{id}` необходимо заменить на уникальный идентификатор требуемого альбома.

Ответ: JSON описание альбома.

Коды ответа: 

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Запрос успешно выполнен. |
| 404 | Not Found | Альбом не найден или является `internal` альбомом другого пользователя. |

Получить альбомы пользователя
-
Если необходимо получить список альбомов интересующего пользователя, необходимо послать запрос:

    GET		/api/user/{username}/albums

Ответ: JSON с массивом альбомов пользователя.

**Внимание**: Если указывать собственное (текущее) имя пользователя в `{username}`, то возвращаются `internal` и `не internal` альбомы, а если запрашиваются альбомы другого пользователя, то возвращаются только `не internal` альбомы.
 
JSON представление ответа:

    {
	    "content": [
	        {
	            "id": "c1ac227d-7075-48fc-b5f9-c99667ff884e",
	            "name": "Первый альбом",
	            "description": "Первый альбом как первая любовь!",
	            "createDate": "2019-10-17T15:50:34.475+0000",
	            "internal": false
	        },
	        {
		        ...
		}
	    ]
    }

В массиве `content` находятся JSON описание альбомов.

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Запрос успешно выполнен. |
| 404 | Not Found | Альбом не найден, либо является `internal` альбомом другого пользователя. |

Обновление альбома
-
Обновление альбома очень похоже на создание альбома.
Для обновления альбома нужно отправить запрос:

    PUT		/api/album/{id}

Со следующим JSON содержимым:

    {
	    "name": "<НОВОЕ ИМЯ АЛЬБОМА>",
	    "description": "<НОВОЕ ОПИСАНИЕ АЛЬБОМА>"
	}

В случае успешного редактирования альбома - вы получите JSON ответ, содержащий полное описание альбома.

Коды ответа:

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Альбом отредактирован успешно. |
| 404 | Not Found | Альбом с таким ID не найден, либо является `internal` альбомом другого пользователя. |
| 400 | Bad request | Один или несколько параметров не задано. |


Удаление альбома
-
Для удаления альбома необходимо отправить запрос:

    DELETE		/api/album/{id}

Ответ не содержит тела.
Коды ответа:

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Альбом удалён успешно. |
| 404 | Not Found | Альбом с таким ID не найден, либо является `internal` альбомом другого пользователя. |


Аудиозаписи
=
Пользователь имеет право загружать аудиозаписи, редактировать и удалять их.
С точки зрения API аудиозапись выглядит следующим образом:

    {
	   "id": "b652f29d-06f1-455e-b3f5-7cfc2e9afaa4",
	   "title": "Название песни",
	   "artist": "Исполнитель",
	   "uploadDate": "2019-10-17T15:00:33.236+0000",
	}

| Имя параметра | Тип данных |  Описание |
| -- | -- | -- |
| `id` | `string` | Уникальный идентификатор песни |
| `title` | `string` | Название песни |
| `artist` | `string` | Исполнитель |
| `uploadDate` | `Date` | Дата загрузки песни |

Загрузка аудиозаписи в альбом
-
Для загрузки аудиозаписи необходимо отправить запрос `multipart/form-data` запрос:

    POST		/api/album/{albumId}/song

Со следующими параметрами в теле запроса:

| Имя параметра | Тип данных |  Описание |
| -- | -- | -- |
| `audio` | `File` | .mp3 файл с content-type: `audio/mp3` |
| `title` | `string` | Название песни |
| `artist` | `string` | Исполнитель |

Со следующим JSON содержимым:
В случае успешной загрузки аудиозаписи - вы получите JSON ответ, содержащий полное описание аудиозаписи.

Коды ответа:

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Аудиозапись успешно создана. |
| 400 | Bad request | Один или несколько параметров не задано. |
| 406 | Not acceptable | Файл неверен (Не является `audio/mp3`). |


Получение информации об аудиозаписи
-

    GET			/api/album/{albumId}/song/{id}

`{id}` необходимо заменить на уникальный идентификатор требуемого аудиозаписи.

Ответ: JSON описание аудиозаписи.

Коды ответа: 

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Запрос успешно выполнен. |
| 404 | Not Found | Альбом или аудиозапись не найдены, либо  аудиозапись находится в `internal` альбоме другого пользователя. |

Воспроизведение MP3
-
Для того, чтобы воспроизвести аудиозапись (начать процесс скачивания) необходимо отправить запрос на следующий endpoint:

    GET			/api/album/{albumId}/song/{id}/mp3

`{id}` необходимо заменить на уникальный идентификатор требуемого аудиозаписи.

Ответ: MP3 файл.

Коды ответа: 

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Инициализация скачивания MP3. |
| 404 | Not Found | Альбом или аудиозапись не найдены, либо  аудиозапись находится в `internal` альбоме другого пользователя. |


Получить аудиозаписи из альбома
-
Чтобы получить список аудио из интересующего альбома, необходимо послать запрос:

    GET			/api/album/{albumId}/songs

Ответ: JSON с массивом альбомов пользователя.
JSON представление ответа:

    {
	    "content": [
	        {
	            "id": "c1ac227d-7075-48fc-b5f9-c99667ff884e",
	            "title": "Весёлая песня",
	            "artist": "Весёлый артист",
	            "uploadDate": "2019-10-17T15:50:34.475+0000"
	        },
	        {
		        ...
		}
	    ]
    }

В массиве `content` находятся JSON описание аудио.

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Инициализация скачивания MP3. |
| 404 | Not Found | Альбом или аудиозапись не найдены, либо  аудиозапись находится в `internal` альбоме другого пользователя. |

Обновление аудиозаписи
-
Обновление аудиозаписи очень похоже на создание аудиозаписи.
Отличие лишь в том, что обновить уже существующий аудиофайл не выйдет, только метаданные.
Для обновления аудиозаписи нужно отправить запрос:

    PUT 		/api/album/{albumId}/song/{id}

Со следующим JSON содержимым:

    {
	    "title": "<НОВЫЙ ЗАГОЛОВОК АУДИОЗАПИСИ>",
	    "artist": "<НОВОЕ ИМЯ АРТИСТА АУДИОЗАПИСИ>"
    }

В случае успешного редактирования аудиозаписи - вы получите JSON ответ, содержащий полное описание аудиозаписи.

Коды ответа:

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Запрос выполнен успешно. |
| 400 | Bad request | Один или несколько параметров не задано. |
| 404 | Not Found | Альбом или аудиозапись не найдены, либо  аудиозапись находится в `internal` альбоме другого пользователя. |


Удаление аудиозаписи
-
Для удаления аудиозаписи необходимо отправить запрос:

    DELETE			/api/album/{albumId}/song/{id}

Ответ не содержит тела.

Коды ответа:

| Код | HTTP описание | Описание |
| :--: | -- | -- |
| 401 | Unauthorized | JWT токен неверен или истёкло его время действия. |
| 200 | OK | Аудиозапись удалена успешно. |
| 404 | Not Found | Альбом или аудиозапись не найдены, либо  аудиозапись находится в `internal` альбоме другого пользователя. |

Вместо заключения
-
Прошу принять к сведению то, что данное API является не конечным и возможны некоторые ошибки и доработки. Пожалуйста, не сердитесь :)
В любом случае: Пишите мне все свои вопросы и предложения :) 

(с) Тумасов Руслан Дмитриевич. 18/10/2019 00:50 (GMT +7)

Edited on: 20/10/2019 19:12
