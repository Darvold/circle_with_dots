import React, {useEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import '../cscc/CircleName.css';

// Типы данных для точек
interface DotData {
    id: number;
    number: string;
    name: string;
    events: {
        year: number;
        description: string;
    }[];
}

const CircleName: React.FC = () => {
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const dotsContainerRef = useRef<HTMLDivElement>(null);
    const activeTitleRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollContentRef = useRef<HTMLDivElement>(null);
    const currentIndexRef = useRef(0);

    const [circleRadius] = useState<number>(200);
    const rotationAngleRef = useRef(0);

    // Состояния для кнопок скролла
    const [showLeftScrollButton, setShowLeftScrollButton] = useState(false);
    const [showRightScrollButton, setShowRightScrollButton] = useState(true);

    // Состояния для drag-to-scroll
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const startYearRef = useRef<HTMLDivElement>(null);
    const endYearRef = useRef<HTMLDivElement>(null);
    // Флаг для debounce проверки скролла
    const scrollCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // состояние для текущих годов
    const [currentStartYear, setCurrentStartYear] = useState(2015);
    const [currentEndYear, setCurrentEndYear] = useState(2022);

    // Данные для точек с несколькими текстами
    const dotsData: DotData[] = [
        {
            id: 0,
            number: '1',
            name: 'Наука',
            events: [
                {
                    year: 2015,
                    description: '13 сентября — частное солнечное затмение, видимое в Южной Африке и части Антарктиды'
                },
                {
                    year: 2016,
                    description: 'Телескоп «Хаббл» обнаружил самую удалённую из всех обнаруженных галактик, получившую обозначение GN-z11'
                },
                {
                    year: 2017,
                    description: 'Компания Tesla официально представила первый в мире электрический грузовик Tesla Semi'
                },
                {year: 2018, description: 'Учёные подтвердили существование гравитационных волн'},
                {year: 2019, description: 'Первое изображение чёрной дыры'}
            ]
        },
        {
            id: 1,
            number: '2',
            name: 'Технологии',
            events: [
                {year: 2020, description: 'Запуск сети 5G в большинстве развитых стран'},
                {year: 2021, description: 'Первые коммерческие полеты на электрических самолетах'},
                {year: 2022, description: 'Массовое внедрение квантовых компьютеров'},
                {year: 2023, description: 'Искусственный интеллект достиг уровня человеческого мышления'}
            ]
        },
        {
            id: 2,
            number: '3',
            name: 'Искусство',
            events: [
                {year: 2018, description: 'Открытие новой выставки современного искусства в Лувре'},
                {year: 2019, description: 'Рекордные продажи на аукционе Christie\'s'},
                {year: 2020, description: 'Виртуальные музеи становятся мейнстримом'},
                {year: 2021, description: 'Цифровое искусство набирает популярность'}
            ]
        },
        {
            id: 3,
            number: '4',
            name: 'Музыка',
            events: [
                {year: 2019, description: 'Грэмми в новых цифровых номинациях'},
                {year: 2020, description: 'Виртуальные концерты собирают миллионы зрителей'},
                {year: 2021, description: 'Возрождение винила и аналогового звука'},
                {year: 2022, description: 'Новый альбом Radiohead побил рекорды стриминга'}
            ]
        },
        {
            id: 4,
            number: '5',
            name: 'Кино',
            events: [
                {year: 2019, description: 'Триумф "Паразитов" на Оскаре'},
                {year: 2020, description: 'Стриминговые сервисы меняют индустрию'},
                {year: 2021, description: 'Возвращение кинотеатров после пандемии'},
                {year: 2022, description: 'Новый фильм Кристофера Нолана'}
            ]
        },
        {
            id: 5,
            number: '6',
            name: 'Литература',
            events: [
                {year: 2018, description: 'Нобелевская премия по литературе вручена Ольге Токарчук'},
                {year: 2019, description: 'Рост популярности аудиокниг и подкастов'},
                {year: 2020, description: 'Цифровые форматы обгоняют печатные издания'},
                {year: 2021, description: 'Новый роман Мураками стал бестселлером'}
            ]
        }
    ];

    const [currentPage, setCurrentPage] = useState<number>(1);
    const totalPages = dotsData.length;

    // Анимация смены года с эффектом счетчика
    const animateYearChange = (fromYear: number, toYear: number, isStart: boolean) => {
        const ref = isStart ? startYearRef : endYearRef;
        const setYear = isStart ? setCurrentStartYear : setCurrentEndYear;

        const yearObj = { value: fromYear };

        gsap.to(yearObj, {
            value: toYear,
            duration: 1.2,
            ease: "power2.inOut",
            onUpdate: function() {
                setYear(Math.round(yearObj.value));
            }
        });
    };

    // Функции для навигации по точкам
    const handlePrev = () => {
        if (isAnimating) return;
        const prevIndex = (currentIndexRef.current - 1 + totalPages) % totalPages;
        rotateToDot(prevIndex);
    };

    const handleNext = () => {
        if (isAnimating) return;
        const nextIndex = (currentIndexRef.current + 1) % totalPages;
        rotateToDot(nextIndex);
    };

    // Функции для горизонтального скролла кнопками
    const handleScrollLeft = () => {
        if (scrollContentRef.current) {
            scrollContentRef.current.scrollBy({
                left: -340,
                behavior: 'smooth'
            });
            // Отложенная проверка позиции
            setTimeout(checkScrollPosition, 300);
        }
    };

    const handleScrollRight = () => {
        if (scrollContentRef.current) {
            scrollContentRef.current.scrollBy({
                left: 340,
                behavior: 'smooth'
            });
            // Отложенная проверка позиции
            setTimeout(checkScrollPosition, 300);
        }
    };

    // Оптимизированные обработчики для drag-to-scroll
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContentRef.current) return;

        e.preventDefault();

        setIsDragging(true);
        startXRef.current = e.pageX - scrollContentRef.current.offsetLeft;
        scrollLeftRef.current = scrollContentRef.current.scrollLeft;

        // Меняем курсор при начале перетаскивания
        if (scrollContentRef.current) {
            scrollContentRef.current.style.cursor = 'grabbing';
            scrollContentRef.current.style.userSelect = 'none';
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContentRef.current) return;

        e.preventDefault();

        const x = e.pageX - scrollContentRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 1.5;

        // Прямое изменение скролла без setState
        scrollContentRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);

            // Возвращаем обычный курсор
            if (scrollContentRef.current) {
                scrollContentRef.current.style.cursor = 'grab';
                scrollContentRef.current.style.userSelect = 'auto';
            }

            // Проверяем позицию после окончания перетаскивания
            checkScrollPosition();
        }
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);

            // Возвращаем обычный курсор
            if (scrollContentRef.current) {
                scrollContentRef.current.style.cursor = 'grab';
                scrollContentRef.current.style.userSelect = 'auto';
            }

            // Проверяем позицию после окончания перетаскивания
            checkScrollPosition();
        }
    };

    // Проверка положения скролла с debounce
    const checkScrollPosition = () => {
        if (scrollContentRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContentRef.current;
            setShowLeftScrollButton(scrollLeft > 10);
            setShowRightScrollButton(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    // Оптимизированный обработчик скролла с debounce
    useEffect(() => {
        const scrollElement = scrollContentRef.current;

        const throttleScroll = () => {
            if (scrollCheckTimeoutRef.current) return;

            scrollCheckTimeoutRef.current = setTimeout(() => {
                checkScrollPosition();
                scrollCheckTimeoutRef.current = null;
            }, 100);
        };

        if (scrollElement) {
            scrollElement.addEventListener('scroll', throttleScroll);
        }

        return () => {
            if (scrollElement) {
                scrollElement.removeEventListener('scroll', throttleScroll);
            }
            if (scrollCheckTimeoutRef.current) {
                clearTimeout(scrollCheckTimeoutRef.current);
            }
        };
    }, []);

    // ПОЛУЧЕНИЕ ЦЕНТРА КОНТЕЙНЕРА
    const getContainerCenter = (): { centerX: number; centerY: number } => {
        if (!dotsContainerRef.current) {
            return {centerX: 0, centerY: 0};
        }

        const container = dotsContainerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        return {centerX, centerY};
    };

    // Получение базового угла для индекса
    const getBaseAngleForIndex = (index: number, total: number): number => {
        const startAngle = -Math.PI / 3;
        const angleStep = (Math.PI * 2) / total;
        return startAngle + (index * angleStep);
    };

    // Обновление заголовка
    const updateActiveTitle = (targetIndex: number) => {
        const newName = dotsData[targetIndex].name;
        const newNumber = dotsData[targetIndex].number;

        gsap.to(activeTitleRef.current, {
            opacity: 0,
            y: -20,
            duration: 0.2,
            onComplete: () => {
                if (activeTitleRef.current) {
                    activeTitleRef.current.innerHTML = `
                        <span class="active-number">${newNumber}</span>
                        <span class="active-name">${newName}</span>
                    `;
                }
                gsap.to(activeTitleRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "back.out(1.2)"
                });
            }
        });
    };

    // Вращение к выбранной точке
    const rotateToDot = (targetIndex: number) => {
        const prevIndex = currentIndexRef.current;

        if (isAnimating) return;
        if (targetIndex === prevIndex) return;
        if (!dotsContainerRef.current) return;

        setIsAnimating(true);
        // Получаем годы для целевой точки
        const targetEvents = dotsData[targetIndex].events;
        const targetStartYear = targetEvents[0].year;
        const targetEndYear = targetEvents[targetEvents.length - 1].year;

        // Получаем текущие годы
        const currentEvents = dotsData[prevIndex].events;
        const currentStartYear = currentEvents[0].year;
        const currentEndYear = currentEvents[currentEvents.length - 1].year;
        // Плавно скрываем swiper
        gsap.to(scrollContainerRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: "power2.in"
        });

        // Анимируем годы (параллельно с вращением точек)
        animateYearChange(currentStartYear, targetStartYear, true);
        animateYearChange(currentEndYear, targetEndYear, false);

        const dots = dotsContainerRef.current.children;
        const totalDots = dots.length;
        const {centerX, centerY} = getContainerCenter();

        const toIndex = targetIndex;

        // ВЫЧИСЛЕНИЕ КРАТЧАЙШЕГО ПУТИ
        const clockwiseSteps = (toIndex - prevIndex + totalDots) % totalDots;
        const counterClockwiseSteps = (prevIndex - toIndex + totalDots) % totalDots;

        let rotationSteps;
        if (clockwiseSteps <= counterClockwiseSteps) {
            rotationSteps = -clockwiseSteps;
        } else {
            rotationSteps = counterClockwiseSteps;
        }

        const anglePerStep = (Math.PI * 2) / totalDots;
        const targetRotationAngle = rotationAngleRef.current + (rotationSteps * anglePerStep);

        const prevDot = dots[prevIndex];
        const nextDot = dots[toIndex];

        prevDot.classList.remove('active');

        const rotationObj = {angle: rotationAngleRef.current};

        // Анимация поворота
        gsap.to(rotationObj, {
            angle: targetRotationAngle,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: function () {
                rotationAngleRef.current = rotationObj.angle;

                Array.from(dots).forEach((dot, index) => {
                    const baseAngle = getBaseAngleForIndex(index, totalDots);
                    const currentAngle = baseAngle + rotationObj.angle;
                    const x = centerX + circleRadius * Math.cos(currentAngle);
                    const y = centerY + circleRadius * Math.sin(currentAngle);
                    gsap.set(dot, {x, y});
                });
            },
            onComplete: () => {
                nextDot.classList.remove('hover');
                nextDot.classList.add('active');

                // Обновляем индекс
                currentIndexRef.current = toIndex;
                setCurrentPage(toIndex + 1);

                // Сбрасываем скролл
                if (scrollContentRef.current) {
                    scrollContentRef.current.scrollTo({
                        left: 0,
                        behavior: 'auto'
                    });
                }

                // Плавно показываем swiper с новым контентом
                gsap.to(scrollContainerRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.inOut"
                });

                setIsAnimating(false);

                // Проверяем положение скролла
                setTimeout(() => {
                    checkScrollPosition();
                }, 100);
            }
        });

        updateActiveTitle(toIndex);
    };

    // Создание точек при монтировании
    useEffect(() => {
        if (!dotsContainerRef.current) return;
        // Устанавливаем начальные годы
        if (dotsData.length > 0) {
            const firstEvents = dotsData[0].events;
            setCurrentStartYear(firstEvents[0].year);
            setCurrentEndYear(firstEvents[firstEvents.length - 1].year);
        }
        dotsContainerRef.current.innerHTML = '';
        dotsData.forEach((dot) => {
            const dotElement = document.createElement('div');
            dotElement.className = `dot ${dot.id === 0 ? 'active' : ''}`;
            dotElement.setAttribute('data-index', dot.id.toString());
            let clicked = false;
            dotElement.innerHTML = `
                <span class="dot-marker">
                    <span class="dot-number">${dot.number}</span>
                </span>
                <span class="dot-name">${dot.name}</span>
            `;

            dotElement.addEventListener('click', () => {
                console.log(`\n🖱️ КЛИК по точке ${dot.id}`);
                clicked = true; //  устанавливаем флаг при клике
                rotateToDot(dot.id);
            });

            dotElement.addEventListener('mouseenter', () => {
                if (!dotElement.classList.contains('active')) {
                    // Добавляем класс hover для показа цифры
                    dotElement.classList.add('hover');

                    gsap.to(dotElement, {
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            dotElement.addEventListener('mouseleave', () => {
                // проверяем, не было ли клика
                if (!dotElement.classList.contains('active') && !clicked) {
                    dotElement.classList.remove('hover');

                    gsap.to(dotElement, {
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });
            // сбрасываем флаг после завершения анимации или когда точка становится активной
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        if (dotElement.classList.contains('active')) {
                            clicked = false; // Сбрасываем флаг
                        }
                    }
                });
            });

            observer.observe(dotElement, { attributes: true });
            dotsContainerRef.current?.appendChild(dotElement);
        });

        setTimeout(() => {
            const dots = dotsContainerRef.current?.children;
            if (!dots) return;

            const totalDots = dots.length;
            const {centerX, centerY} = getContainerCenter();

            Array.from(dots).forEach((dot, index) => {
                const baseAngle = getBaseAngleForIndex(index, totalDots);
                const x = centerX + circleRadius * Math.cos(baseAngle);
                const y = centerY + circleRadius * Math.sin(baseAngle);
                gsap.set(dot, {x, y});
            });

            rotationAngleRef.current = 0;
        }, 100);

        if (activeTitleRef.current) {
            activeTitleRef.current.innerHTML = `
                <span class="active-number">${dotsData[0].number}</span>
                <span class="active-name">${dotsData[0].name}</span>
            `;
        }
    }, []);

    // Обновление позиций при изменении размера окна
    useEffect(() => {
        const handleResize = () => {
            if (!dotsContainerRef.current) return;

            const dots = dotsContainerRef.current.children;
            const totalDots = dots.length;
            const {centerX, centerY} = getContainerCenter();

            Array.from(dots).forEach((dot, index) => {
                const baseAngle = getBaseAngleForIndex(index, totalDots);
                const currentAngle = baseAngle + rotationAngleRef.current;
                const x = centerX + circleRadius * Math.cos(currentAngle);
                const y = centerY + circleRadius * Math.sin(currentAngle);
                gsap.set(dot, {x, y});
            });

            setTimeout(checkScrollPosition, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [circleRadius]);

    return (
        <div className="appCircle">
            <div className="container">
                {/* Блок с годами */}
                <div className="years-container">
                    <div className="year2">
                        <span ref={startYearRef}>{currentStartYear}</span>
                        <span> </span>
                        <span ref={endYearRef}>{currentEndYear}</span>
                    </div>
                </div>
                {/* Круг с точками */}
                <div className="circle-container">

                    <div className="circle-border"></div>
                    <div
                        className="dots-wrapper"
                        ref={dotsContainerRef}
                        style={{
                            width: '500px',
                            height: '500px',
                            position: 'relative'
                        }}
                    ></div>
                </div>

                {/* Навигационные кнопки для точек */}
                <div className="navigation-container">
                    <div className="pagination-info">
                        {String(currentPage).padStart(2, '0')}/{String(totalPages).padStart(2, '0')}
                    </div>
                    <div className="nav-buttons">
                        <button
                            className="nav-button prev"
                            onClick={handlePrev}
                            disabled={isAnimating}
                        >
                            <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.5 1L1.5 6L6.5 11" stroke="currentColor" strokeWidth="2"
                                      strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <button
                            className="nav-button next"
                            onClick={handleNext}
                            disabled={isAnimating}
                        >
                            <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 1L6.5 6L1.5 11" stroke="currentColor" strokeWidth="2"
                                      strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Горизонтальный скролл с блоками */}
                <div className="scroll-section" ref={scrollContainerRef}>
                    <div className="scroll-container">
                        <div className="block-absolute">
                        {showLeftScrollButton && (
                            <button
                                className="scroll-button scroll-button-left"
                                onClick={handleScrollLeft}
                                aria-label="Прокрутить влево"
                            >
                                <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.5 1L1.5 6L6.5 11" stroke="currentColor" strokeWidth="2"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        )}
                        </div>

                        <div
                            className="scroll-content"
                            ref={scrollContentRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseLeave}
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        >
                            {dotsData[currentIndexRef.current]?.events.map((event, index) => (
                                <div key={index} className="event-block">
                                    <div className="event-year">{event.year}</div>
                                    <div className="event-description">{event.description}</div>
                                </div>
                            ))}
                        </div>
                        <div className="block-absolute">
                        {showRightScrollButton && (
                            <button
                                className="scroll-button scroll-button-right"
                                onClick={handleScrollRight}
                                aria-label="Прокрутить вправо"
                            >
                                <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.5 1L6.5 6L1.5 11" stroke="currentColor" strokeWidth="2"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        )}
                        </div>
                    </div>
                </div>

                {/* Индикаторы навигации (точки) */}
                <div className="navigation-dots">
                    {dotsData.map((dot, index) => (
                        <button
                            key={dot.id}
                            className={`nav-dot ${index === currentIndexRef.current ? 'active' : ''}`}
                            onClick={() => rotateToDot(dot.id)}
                            disabled={isAnimating}
                            aria-label={`Перейти к ${dot.name}`}
                        />
                    ))}
                </div>


            </div>
        </div>
    );
};

export default CircleName;